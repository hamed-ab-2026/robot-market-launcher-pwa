import React, {useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {
    Button,
    Empty,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Radio,
    Space,
    Table,
    Tag,
    Tooltip
} from
        "antd";
import {
    ApiOutlined,
    CloudOutlined,
    DeleteOutlined,
    DesktopOutlined,
    EditOutlined,
    InfoCircleOutlined,
    LinkOutlined,
    PlayCircleOutlined,
    ReloadOutlined,
    SafetyCertificateOutlined,
    WifiOutlined
} from
        "@ant-design/icons";

import LanguageSwitcher from "../components/common/LanguageSwitcher";
import ThemeToggle from "../components/common/ThemeToggle";
import RobotMascot from "../components/common/RobotMascot";
import PersianDateTime from "../components/common/PersianDateTime";
import {useConnectivityStatus} from "../hooks/useConnectivityStatus";
import {buildDeviceBaseUrl, fetchDeviceInfo, loginToOnlinePanel} from "../services/deviceApi";
import {
    deleteDevice,
    getEditableDevice,
    getEditableOnlinePanel,
    loadDevices,
    saveDevice,
    saveOnlinePanel
} from
        "../services/hubStorage";

const EMPTY_DEVICE = {
    name: "",
    serial: "",
    type: "robot",
    connectionMode: "dhcp",
    ipAddress: "",
    username: "",
    password: ""
};
const MIN_NEW_PASSWORD_LENGTH = 8;


/**
 * صفحه مرکزی مدیریت پنل ابری و دستگاه‌های محلی است.
 * این کامپوننت مودال‌ها، جدول، ذخیره اطلاعات، رمزگشایی رمزها و دو روش باز کردن پنل دستگاه را هماهنگ می‌کند.
 */
export default function MainHub() {
    const {t} = useTranslation();
    const {status: connectivityStatus, checkConnection} = useConnectivityStatus();
    const [videoUnavailable, setVideoUnavailable] = useState(false);
    const tutorialVideoUrl = import.meta.env.VITE_TUTORIAL_VIDEO_URL || "/videos/tutorial.mp4";
    const [devices, setDevices] = useState(loadDevices);
    const [deviceModalOpen, setDeviceModalOpen] = useState(false);
    const [onlineModalOpen, setOnlineModalOpen] = useState(false);
    const [iframeDevice, setIframeDevice] = useState(null);
    const [editingDevice, setEditingDevice] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [passwordChangeContext, setPasswordChangeContext] = useState(null);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [deviceForm] = Form.useForm();
    const [onlineForm] = Form.useForm();
    const [changePasswordForm] = Form.useForm();
    const connectionMode = Form.useWatch("connectionMode", deviceForm) || "dhcp";
    const serialValue = Form.useWatch("serial", deviceForm) || "SN404023";


    /** اطلاعات قبلی پنل آنلاین را رمزگشایی و قبل از نمایش مودال داخل فرم قرار می‌دهد. */
    async function openOnlineLogin() {
        try {
            onlineForm.setFieldsValue(await getEditableOnlinePanel());
        } catch {
            onlineForm.resetFields();
        }
        setOnlineModalOpen(true);
    }


    /** فرم آنلاین را اعتبارسنجی، رمز را امن ذخیره و آداپتور موقت ورود ابری را اجرا می‌کند. */
    async function handleOnlineLogin() {
        const values = await onlineForm.validateFields();
        setIsSaving(true);
        try {
            await saveOnlinePanel(values);
            await loginToOnlinePanel(values);
            message.success(t("hub.messages.credentialsSaved"));
            setOnlineModalOpen(false);
        } catch {
            message.error(t("hub.messages.saveFailed"));
        } finally {
            setIsSaving(false);
        }
    }


    /** وضعیت و فرم را برای ساخت یک دستگاه تازه پاک‌سازی می‌کند و مودال را باز می‌کند. */
    function openAddDevice() {
        setEditingDevice(null);
        deviceForm.setFieldsValue(EMPTY_DEVICE);
        setDeviceModalOpen(true);
    }


    /** دستگاه انتخاب‌شده را رمزگشایی و همه فیلدهای آن را برای ویرایش در فرم بارگذاری می‌کند. */
    async function openEditDevice(device) {
        setEditingDevice(device);
        try {
            deviceForm.setFieldsValue(await getEditableDevice(device));
            setDeviceModalOpen(true);
        } catch {
            message.error(t("hub.messages.decryptFailed"));
        }
    }


    async function handleSaveDevice() {
        const values = await deviceForm.validateFields();
        setIsSaving(true);
        try {
            const candidate = {...editingDevice, ...values};
            await saveDevice(candidate);
            setDevices(loadDevices());
            setDeviceModalOpen(false);
            message.success(t(editingDevice ? "hub.messages.deviceUpdated" : "hub.messages.deviceAdded"));
        } catch {
            message.error(t("hub.messages.connectionFailed"));
        } finally {
            setIsSaving(false);
        }
    }


    /** دستگاه تأییدشده را حذف و فهرست قابل مشاهده را از حافظه محلی بازخوانی می‌کند. */
    function handleDeleteDevice(deviceId) {
        deleteDevice(deviceId);
        setDevices(loadDevices());
        message.success(t("hub.messages.deviceDeleted"));
    }


    /** اطلاعات پایه همه دستگاه‌های ثبت‌شده را از آداپتور API دریافت و نتیجه عملیات را اعلام می‌کند. */
    async function refreshBaseInformation() {
        if (!devices.length) {
            message.info(t("hub.messages.noDevices"));
            return;
        }
        setIsRefreshing(true);
        try {
            await Promise.all(devices.map(fetchDeviceInfo));
            message.success(t("hub.messages.baseInfoReceived"));
        } catch {
            message.error(t("hub.messages.connectionFailed"));
        } finally {
            setIsRefreshing(false);
        }
    }


    async function loginThenOpenDevice(device, openMode) {
        let deviceWithCredentials;

        try {
            deviceWithCredentials = await getEditableDevice(device);
        } catch (error) {
            console.error("Could not decrypt device credentials", error);
            message.warning(t("hub.messages.autoLoginFailed"));
            openDevicePanel(device, openMode);
            return;
        }

        const username = deviceWithCredentials.username?.trim();
        const password = deviceWithCredentials.password;

        if (!username || !password) {
            message.warning(t("hub.messages.missingCredentials"));
            openDevicePanel(device, openMode);
            return;
        }

        const baseUrl = buildDeviceBaseUrl(deviceWithCredentials);

        try {
            const response = await fetch(`${baseUrl}/api/login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username, password})
            });

            if (!response.ok) {
                throw new Error(`API_ERROR_${response.status}`);
            }

            const loginResult = await response.json();

            if (!loginResult?.success) {
                throw new Error("DEVICE_LOGIN_REJECTED");
            }

            if (loginResult.isFirstTime) {
                setPasswordChangeContext({
                    device,
                    openMode,
                    username,
                    oldPassword: password
                });
                changePasswordForm.setFieldsValue({
                    oldPassword: password,
                    newPassword: "",
                    confirmPassword: ""
                });
                return;
            }

            if (!loginResult.token) {
                throw new Error("DEVICE_LOGIN_TOKEN_MISSING");
            }

            openDevicePanel(device, openMode, {
                token: loginResult.token,
                role: loginResult.role
            });
        } catch (error) {
            console.error("Automatic device login failed", error);
            message.warning(t("hub.messages.autoLoginFailed"));
            openDevicePanel(device, openMode);
        }
    }

    async function handleRequiredPasswordChange() {
        if (!passwordChangeContext) return;

        const values = await changePasswordForm.validateFields();
        const {device, openMode, username} = passwordChangeContext;
        const baseUrl = buildDeviceBaseUrl(device);

        setIsChangingPassword(true);
        try {
            const response = await fetch(`${baseUrl}/api/change-password`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    username,
                    oldPassword: values.oldPassword,
                    newPassword: values.newPassword
                })
            });

            if (!response.ok) {
                throw new Error(`API_ERROR_${response.status}`);
            }

            const result = await response.json();
            if (!result?.success || !result.token) {
                throw new Error("PASSWORD_CHANGE_REJECTED");
            }

            // فقط بعد از تأیید API، رمز جدید جایگزین رمز رمزنگاری‌شده قبلی می‌شود.
            await saveDevice({
                ...device,
                username,
                password: values.newPassword
            });
            setDevices(loadDevices());

            setPasswordChangeContext(null);
            changePasswordForm.resetFields();
            message.success(t("hub.messages.passwordChanged"));
            openDevicePanel(device, openMode, {
                token: result.token,
                role: result.role
            });
        } catch (error) {
            console.error("Device password change failed", error);
            const isInvalidOldPassword = String(error?.message).includes("401");
            message.error(t(isInvalidOldPassword ?
                "hub.messages.oldPasswordInvalid" :
                "hub.messages.passwordChangeFailed"));
        } finally {
            setIsChangingPassword(false);
        }
    }

    function openDevicePanel(device, openMode, autoLogin = null) {
        const baseUrl = buildDeviceBaseUrl(device);
        let panelUrl = baseUrl;

        if (autoLogin) {
            const targetUrl = new URL(baseUrl);
            targetUrl.hash = `rm_auto_login=${encodeURIComponent(JSON.stringify(autoLogin))}`;
            panelUrl = targetUrl.toString();
        }

        if (openMode === "iframe") {
            setIframeDevice({...device, panelUrl});
        } else {
            window.location.assign(panelUrl);
        }
    }

    const columns = useMemo(() => [
            {
                title: t("hub.table.device"),
                dataIndex: "name",
                key: "name",
                width: 50,
                render: (name, device) =>
                    <div>
                        <div className="font-semibold text-slate-800 dark:text-white">{name}</div>
                        <div className="mt-1 text-xs text-slate-400" dir="ltr">{buildDeviceBaseUrl(device)}</div>
                    </div>

            },
            {
                title: t("hub.table.serial"),
                dataIndex: "serial",
                key: "serial",
                width: 80,
                render: (serial) => <span dir="ltr">{serial}</span>
            },
            // {
            //     title: t("hub.table.connection"),
            //     dataIndex: "connectionMode",
            //     key: "connectionMode",
            //     width: 140,
            //     render: (mode) =>
            //         <Tag color={mode === "dhcp" ? "cyan" : "geekblue"}>
            //             {mode === "dhcp" ? t("hub.deviceForm.dhcp") : t("hub.deviceForm.staticIp")}
            //         </Tag>
            //
            // },
            {
                title: t("hub.table.actions"),
                key: "actions",
                width: 80,
                render: (_, device) =>
                    <Space size="small" wrap>
                        <Tooltip title={t("hub.actions.iframe")}>
                            <Button type="text" icon={<DesktopOutlined/>}
                                    onClick={() => loginThenOpenDevice(device, "iframe")}/>
                        </Tooltip>
                        <Tooltip title={t("hub.actions.direct")}>
                            <Button type="text" icon={<LinkOutlined/>}
                                    onClick={() => loginThenOpenDevice(device, "direct")}/>
                        </Tooltip>
                        <Tooltip title={t("hub.actions.edit")}>
                            <Button type="text" icon={<EditOutlined/>} onClick={() => openEditDevice(device)}/>
                        </Tooltip>
                        <Popconfirm
                            title={t("hub.actions.deleteConfirm")}
                            okText={t("common.confirm")}
                            cancelText={t("common.cancel")}
                            onConfirm={() => handleDeleteDevice(device.id)}>

                            <Tooltip title={t("hub.actions.delete")}>
                                <Button danger type="text" icon={<DeleteOutlined/>}/>
                            </Tooltip>
                        </Popconfirm>
                    </Space>

            }],
        [t]);

    return (
        <div className="min-h-screen bg-surface-light pb-10 dark:bg-surface-dark">
            <header
                className="sticky top-0 z-20 border-b border-white/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
                <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
                    <RobotMascot variant="robot" className="h-10 w-10 flex-none"/>
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate font-bold text-slate-800 dark:text-white">{t("hub.title")}</h1>
                        <button
                            type="button"
                            onClick={checkConnection}
                            className={`mt-0.5 flex items-center gap-1.5 text-xs font-medium ${
                                connectivityStatus === "online" ? "text-emerald-600 dark:text-emerald-400" :
                                    connectivityStatus === "offline" ? "text-red-500 dark:text-red-400" :
                                        "text-amber-500 dark:text-amber-400"
                            }`}>
                            <WifiOutlined/>
                            {t(`hub.connectivity.${connectivityStatus}`)}
                            <ReloadOutlined className={connectivityStatus === "checking" ? "animate-spin" : ""}/>
                        </button>
                    </div>
                    <div className="hidden md:block"><PersianDateTime/></div>
                    <Button
                        className="hidden sm:inline-flex"
                        icon={<InfoCircleOutlined/>}
                        loading={isRefreshing}
                        onClick={refreshBaseInformation}>

                        {t("hub.receiveBaseInfo")}
                    </Button>
                    <LanguageSwitcher/>
                    <ThemeToggle/>
                </div>
            </header>

            <main className="mx-auto max-w-6xl space-y-5 px-4 pt-5 sm:px-6">
                <section
                    className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3 border-b border-slate-100 p-4 sm:p-5 dark:border-slate-800">
                        <span
                            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-xl text-brand-600 dark:bg-brand-900/40 dark:text-brand-300"><PlayCircleOutlined/></span>
                        <div>
                            <h2 className="font-bold text-slate-800 dark:text-white">{t("hub.tutorial.title")}</h2>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("hub.tutorial.description")}</p>
                        </div>
                    </div>
                    <div className="bg-slate-950">
                        {!videoUnavailable ?
                            <video className="aspect-video max-h-[520px] w-full" controls preload="metadata" playsInline
                                   onError={() => setVideoUnavailable(true)}>
                                <source src={tutorialVideoUrl}/>
                            </video> :
                            <div
                                className="flex aspect-video max-h-[420px] w-full flex-col items-center justify-center gap-3 px-6 text-center text-slate-300">
                                <PlayCircleOutlined className="text-5xl text-brand-400"/>
                                <p className="max-w-lg text-sm">{t("hub.tutorial.placeholder")}</p>
                            </div>
                        }
                    </div>
                </section>

                <div className="md:hidden"><PersianDateTime/></div>

                <Button
                    block
                    className="sm:hidden"
                    icon={<InfoCircleOutlined/>}
                    loading={isRefreshing}
                    onClick={refreshBaseInformation}>

                    {t("hub.receiveBaseInfo")}
                </Button>

                <section className="grid gap-4 lg:grid-cols-2">
                    <PanelCard
                        icon={<CloudOutlined/>}
                        title={t("hub.onlinePanel.title")}
                        description={t("hub.onlinePanel.description")}
                        buttonText={t("hub.onlinePanel.button")}
                        onClick={openOnlineLogin}/>

                    <PanelCard
                        icon={<ApiOutlined/>}
                        title={t("hub.offlinePanel.title")}
                        description={t("hub.offlinePanel.description")}
                        buttonText={t("hub.addDevice")}
                        onClick={openAddDevice}/>

                </section>

                <section
                    className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div
                        className="flex items-center justify-between gap-3 border-b border-slate-100 p-4 sm:p-5 dark:border-slate-800">
                        <div>
                            <h2 className="font-bold text-slate-800 dark:text-white">{t("hub.deviceList")}</h2>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("hub.deviceListDescription")}</p>
                        </div>
                    </div>
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={devices}
                        pagination={false}
                        scroll={{x: 720}}
                        locale={{emptyText: <Empty description={t("hub.emptyDevices")}/>}}/>

                </section>

                {iframeDevice &&
                    <section
                        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div
                            className="flex items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-700">
                            <div className="min-w-0">
                                <h2 className="truncate font-semibold text-slate-800 dark:text-white">{iframeDevice.name}</h2>
                                <p className="truncate text-xs text-slate-400"
                                   dir="ltr">{buildDeviceBaseUrl(iframeDevice)}</p>
                            </div>
                            <Button onClick={() => setIframeDevice(null)}>{t("common.close")}</Button>
                        </div>
                        <iframe
                            src={iframeDevice.panelUrl || buildDeviceBaseUrl(iframeDevice)}
                            title={iframeDevice.name}
                            className="h-[65vh] min-h-[420px] w-full bg-white"/>

                    </section>
                }
            </main>

            <Modal
                title={t("hub.passwordChange.title")}
                open={Boolean(passwordChangeContext)}
                confirmLoading={isChangingPassword}
                okText={t("hub.passwordChange.submit")}
                cancelText={t("common.cancel")}
                onOk={handleRequiredPasswordChange}
                onCancel={() => {
                    setPasswordChangeContext(null);
                    changePasswordForm.resetFields();
                }}
                destroyOnClose>

                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                    {t("hub.passwordChange.description")}
                </p>
                <Form form={changePasswordForm} layout="vertical">
                    <Form.Item
                        name="oldPassword"
                        label={t("hub.passwordChange.oldPassword")}
                        rules={[{required: true, message: t("hub.passwordChange.required")}]}>
                        <Input.Password autoComplete="current-password"/>
                    </Form.Item>
                    <Form.Item
                        name="newPassword"
                        label={t("hub.passwordChange.newPassword")}
                        rules={[
                            {required: true, message: t("hub.passwordChange.required")},
                            {
                                min: MIN_NEW_PASSWORD_LENGTH,
                                message: t("hub.passwordChange.tooShort", {count: MIN_NEW_PASSWORD_LENGTH})
                            }
                        ]}>
                        <Input.Password autoComplete="new-password"/>
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        label={t("hub.passwordChange.confirmPassword")}
                        dependencies={["newPassword"]}
                        rules={[
                            {required: true, message: t("hub.passwordChange.required")},
                            ({getFieldValue}) => ({
                                validator(_, value) {
                                    return !value || getFieldValue("newPassword") === value ?
                                        Promise.resolve() :
                                        Promise.reject(new Error(t("hub.passwordChange.mismatch")));
                                }
                            })
                        ]}>
                        <Input.Password autoComplete="new-password"/>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={t("hub.onlineModal.title")}
                open={onlineModalOpen}
                confirmLoading={isSaving}
                okText={t("hub.onlineModal.submit")}
                cancelText={t("common.cancel")}
                onOk={handleOnlineLogin}
                onCancel={() => setOnlineModalOpen(false)}>

                <div
                    className="mb-5 rounded-2xl bg-brand-50 p-4 text-sm text-brand-800 dark:bg-brand-900/30 dark:text-brand-200">
                    <SafetyCertificateOutlined className="me-2"/>
                    {t("hub.onlineModal.secureHint")}
                </div>
                <Form form={onlineForm} layout="vertical">
                    <Form.Item name="username" label={t("hub.fields.username")} rules={[{required: true}]}>
                        <Input autoComplete="username"/>
                    </Form.Item>
                    <Form.Item name="password" label={t("hub.fields.password")} rules={[{required: true}]}>
                        <Input.Password autoComplete="current-password"/>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={t(editingDevice ? "hub.deviceForm.editTitle" : "hub.deviceForm.addTitle")}
                open={deviceModalOpen}
                confirmLoading={isSaving}
                okText={t("common.confirm")}
                cancelText={t("common.cancel")}
                onOk={handleSaveDevice}
                onCancel={() => setDeviceModalOpen(false)}
                destroyOnClose>

                <Form form={deviceForm} layout="vertical" initialValues={EMPTY_DEVICE}>
                    <Form.Item name="connectionMode" label={t("hub.deviceForm.connectionMode")}>
                        <Radio.Group buttonStyle="solid">
                            <Radio.Button value="dhcp">{t("hub.deviceForm.dhcp")}</Radio.Button>
                            <Radio.Button value="static">{t("hub.deviceForm.staticIp")}</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item name="name" label={t("hub.fields.deviceName")} rules={[{required: true}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        name="serial"
                        label={t("hub.fields.serial")}
                        rules={[{required: connectionMode === "dhcp"}]}
                        extra={connectionMode === "dhcp" ? t("hub.deviceForm.hostnamePreview", {serial: serialValue}) : undefined}>

                        <Input dir="ltr" placeholder="SN404023"/>
                    </Form.Item>
                    {connectionMode === "static" &&
                        <Form.Item name="ipAddress" label={t("hub.fields.ipAddress")} rules={[{required: true}]}>
                            <Input dir="ltr" placeholder="192.168.1.100"/>
                        </Form.Item>
                    }
                    <Form.Item name="type" label={t("hub.fields.deviceType")}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="username" label={t("hub.fields.username")}>
                        <Input autoComplete="username"/>
                    </Form.Item>
                    <Form.Item name="password" label={t("hub.fields.password")}>
                        <Input.Password autoComplete="new-password"/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>);

}


/** کارت معرفی مشترک پنل آنلاین و آفلاین را رندر می‌کند تا ساختار و ظاهر آن‌ها تکرار نشود. */
function PanelCard({icon, title, description, buttonText, onClick}) {
    return (
        <article
            className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div
                className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-brand-50 text-2xl text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <h2 className="font-bold text-slate-800 dark:text-white">{title}</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p>
            </div>
            <Button type="primary" onClick={onClick}>{buttonText}</Button>
        </article>);

}
