import React, {useEffect, useMemo, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {
    Button,
    Carousel,
    Empty,
    Form,
    Input,
    message,
    Modal,
    Radio,
    Select,
    Space,
    Table,
    Tag,
    Tooltip
} from
        "antd";
import {
    ApiOutlined,
    AppstoreOutlined,
    CloudOutlined,
    DeleteOutlined,
    DesktopOutlined,
    EditOutlined,
    LinkOutlined,
    MessageOutlined,
    PlayCircleOutlined,
    ReloadOutlined,
    SafetyCertificateOutlined,
    SettingOutlined,
    WifiOutlined
} from
        "@ant-design/icons";

import LanguageSwitcher from "../components/common/LanguageSwitcher";
import ThemeToggle from "../components/common/ThemeToggle";
import RobotMascot from "../components/common/RobotMascot";
import PersianDateTime from "../components/common/PersianDateTime";
import {useConnectivityStatus} from "../hooks/useConnectivityStatus";
import {
    buildDeviceBaseUrl,
    fetchDeviceInfoByIp,
    fetchDeviceInfoBySerial,
    fetchDeviceTypes,
    loginToOnlinePanel
} from "../services/deviceApi";
import {
    deleteDevice,
    getEditableDevice,
    getEditableOnlinePanel,
    loadDevices,
    loadOnlinePanel,
    saveDevice,
    saveOnlinePanel,
    updateDeviceMetadata
} from
        "../services/hubStorage";

const ONLINE_PANEL_URL = "https://panel.my-rm.com/login";
const EMPTY_DEVICE = {
    deviceTypeId: undefined,
    serial: "",
    installationLocation: "",
    type: "",
    plateSerial: "",
    ipAddress: "",
    username: "",
    password: ""
};
const MIN_NEW_PASSWORD_LENGTH = 8;
const DEVICE_STATUS_INTERVAL_MS = 10 * 60_000;
const IP_CHANGE_RELOAD_DELAY_MS = 2_500;


function isValidIpv4(value) {
    const parts = String(value || "").trim().split(".");
    return parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}


const TUTORIAL_SLIDES = [
    {
        id: "tutorial-1",
        aparatUrl: "https://www.aparat.com/video/video/embed/videohash/i58zd9s/vt/frame"
    },
    {
        id: "tutorial-2",
        aparatUrl: "https://www.aparat.com/video/video/embed/videohash/i58zd9s/vt/frame"
    },
    {
        id: "tutorial-3",
        aparatUrl: "https://www.aparat.com/video/video/embed/videohash/i58zd9s/vt/frame"
    }
];


export default function MainHub() {
    const {t} = useTranslation();
    const {status: connectivityStatus, checkConnection} = useConnectivityStatus();
    const [devices, setDevices] = useState(loadDevices);
    const [deviceModalOpen, setDeviceModalOpen] = useState(false);
    const [onlineModalOpen, setOnlineModalOpen] = useState(false);
    const [activePanel, setActivePanel] = useState("offline");
    const [hasOnlineCredentials, setHasOnlineCredentials] = useState(
        () => Boolean(loadOnlinePanel().username)
    );
    const [iframeDevice, setIframeDevice] = useState(null);
    const [editingDevice, setEditingDevice] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [onlineActionLoading, setOnlineActionLoading] = useState(null);
    const [pendingOnlineOpenMode, setPendingOnlineOpenMode] = useState("iframe");
    const [deviceActionLoading, setDeviceActionLoading] = useState({});
    const [isFrameReady, setIsFrameReady] = useState(false);
    const frameTimeoutRef = useRef(null);
    const reloadScheduledRef = useRef(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isQueryingSerial, setIsQueryingSerial] = useState(false);
    const [deviceStatuses, setDeviceStatuses] = useState({});
    const [deviceTypes, setDeviceTypes] = useState([]);
    const [isLoadingDeviceTypes, setIsLoadingDeviceTypes] = useState(false);
    const [passwordChangeContext, setPasswordChangeContext] = useState(null);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [advancedDevice, setAdvancedDevice] = useState(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatText, setChatText] = useState("");
    const [chatMessages, setChatMessages] = useState([]);
    const [deviceForm] = Form.useForm();
    const [onlineForm] = Form.useForm();
    const [changePasswordForm] = Form.useForm();


    useEffect(() => {
        let cancelled = false;

        async function checkAllDevices() {
            const storedDevices = loadDevices();
            if (!storedDevices.length) return;

            setDeviceStatuses((current) => ({
                ...current,
                ...Object.fromEntries(storedDevices.map((device) => [device.id, "checking"]))
            }));

            await Promise.allSettled(storedDevices.map(async (device) => {
                let currentIp = device.ipAddress;

                if (device.serial) {
                    try {
                        const discovered = await fetchDeviceInfoBySerial(device.serial);
                        currentIp = discovered.ipAddress || currentIp;
                        const ipHasChanged = Boolean(
                            device.ipAddress && discovered.ipAddress && device.ipAddress !== discovered.ipAddress
                        );
                        updateDeviceMetadata(device.id, {
                            ipAddress: currentIp,
                            type: discovered.type || device.type,
                            plateSerial: discovered.plateSerial || device.plateSerial,
                            lastIpCheckAt: new Date().toISOString(),
                            lastIpCheckStatus: "success"
                        });

                        if (ipHasChanged && !reloadScheduledRef.current) {
                            reloadScheduledRef.current = true;
                            message.info(t("hub.messages.deviceIpChanged", {name: device.name}), 2.5);
                            window.setTimeout(() => window.location.reload(), IP_CHANGE_RELOAD_DELAY_MS);
                        }
                    } catch {
                        updateDeviceMetadata(device.id, {
                            lastIpCheckAt: new Date().toISOString(),
                            lastIpCheckStatus: "failed"
                        });
                    }
                }

                try {
                    if (!currentIp) throw new Error("DEVICE_IP_MISSING");
                    await fetchDeviceInfoByIp(currentIp);
                    if (!cancelled) {
                        setDeviceStatuses((current) => ({...current, [device.id]: "active"}));
                    }
                } catch {
                    if (!cancelled) {
                        setDeviceStatuses((current) => ({...current, [device.id]: "inactive"}));
                    }
                }
            }));

            if (!cancelled) setDevices(loadDevices());
        }

        checkAllDevices();
        const interval = window.setInterval(checkAllDevices, DEVICE_STATUS_INTERVAL_MS);
        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [t]);


    async function openOnlineLogin() {
        try {
            onlineForm.setFieldsValue(await getEditableOnlinePanel());
        } catch {
            onlineForm.resetFields();
        }
        setOnlineModalOpen(true);
    }


    async function handleOnlineLogin() {
        const values = await onlineForm.validateFields();
        setIsSaving(true);
        try {
            await saveOnlinePanel(values);
            setHasOnlineCredentials(true);
            message.success(t("hub.messages.credentialsSaved"));
            setOnlineModalOpen(false);
            await startOnlineLogin(pendingOnlineOpenMode, values);
        } catch {
            message.error(t("hub.messages.saveFailed"));
        } finally {
            setIsSaving(false);
        }
    }

    async function requestOnlineOpen(openMode) {
        setPendingOnlineOpenMode(openMode);
        if (!hasOnlineCredentials) {
            await openOnlineLogin();
            return;
        }
        await startOnlineLogin(openMode);
    }

    /** از آداپتور API توکن ورود می‌گیرد و نشانی برگشتی را در حالت انتخاب‌شده باز می‌کند. */
    async function startOnlineLogin(openMode, providedCredentials = null) {
        let credentials = providedCredentials;
        try {
            credentials ||= await getEditableOnlinePanel();
        } catch {
            message.error(t("hub.messages.decryptFailed"));
            return;
        }

        if (!credentials.username || !credentials.password) {
            message.warning(t("hub.messages.missingOnlineCredentials"));
            await openOnlineLogin();
            return;
        }

        setOnlineActionLoading(openMode);
        try {
            const result = await loginToOnlinePanel(credentials);
            if (!result?.ok) throw new Error("ONLINE_LOGIN_REJECTED");

            const targetUrl = new URL(result.redirectUrl || ONLINE_PANEL_URL);
            if (result.token) targetUrl.searchParams.set("token", result.token);

            if (openMode === "iframe") {
                setActivePanel("online");
                setIsFrameReady(false);
                setIframeDevice({
                    name: t("hub.onlinePanel.title"),
                    panelUrl: targetUrl.toString(),
                    isOnlinePanel: true
                });
                beginFrameTimeout();
            } else {
                window.location.assign(targetUrl.toString());
            }
        } catch {
            message.error(t("hub.messages.onlineLoginFailed"));
        } finally {
            setOnlineActionLoading(null);
        }
    }

    function beginFrameTimeout() {
        clearTimeout(frameTimeoutRef.current);
        frameTimeoutRef.current = setTimeout(() => {
            setIframeDevice(null);
            setIsFrameReady(false);
            message.error(t("hub.messages.iframeNotAllowed"));
        }, 12_000);
    }

    function handlePanelFrameLoad() {
        clearTimeout(frameTimeoutRef.current);
        setIsFrameReady(true);
    }

    function handlePanelFrameError() {
        clearTimeout(frameTimeoutRef.current);
        setIframeDevice(null);
        setIsFrameReady(false);
        message.error(t("hub.messages.iframeNotAllowed"));
    }


    /** وضعیت و فرم را برای ساخت یک دستگاه تازه پاک‌سازی می‌کند و مودال را باز می‌کند. */
    function openAddDevice() {
        setEditingDevice(null);
        deviceForm.resetFields();
        deviceForm.setFieldsValue(EMPTY_DEVICE);
        setDeviceModalOpen(true);
        loadDeviceTypes();
    }


    async function loadDeviceTypes() {
        setIsLoadingDeviceTypes(true);
        try {
            setDeviceTypes(await fetchDeviceTypes());
        } catch {
            setDeviceTypes([]);
            message.error(t("hub.messages.deviceTypesFailed"));
        } finally {
            setIsLoadingDeviceTypes(false);
        }
    }


    /** دستگاه انتخاب‌شده را رمزگشایی و همه فیلدهای آن را برای ویرایش در فرم بارگذاری می‌کند. */
    async function openEditDevice(device) {
        setEditingDevice(device);
        try {
            const editableDevice = await getEditableDevice(device);
            deviceForm.setFieldsValue(editableDevice);
            setDeviceModalOpen(true);
            loadDeviceTypes();
        } catch {
            message.error(t("hub.messages.decryptFailed"));
        }
    }


    async function queryDeviceBySerial({showSuccessMessage = true} = {}) {
        const {serial} = await deviceForm.validateFields(["serial"]);
        setIsQueryingSerial(true);
        try {
            const deviceInfo = await fetchDeviceInfoBySerial(serial);
            if (!deviceInfo.ipAddress) throw new Error("DEVICE_IP_MISSING");
            deviceForm.setFieldsValue({
                ipAddress: deviceInfo.ipAddress,
                type: deviceInfo.type,
                plateSerial: deviceInfo.plateSerial
            });
            if (showSuccessMessage) message.success(t("hub.messages.deviceQuerySuccess"));
            return deviceInfo;
        } catch (error) {
            if (showSuccessMessage) message.error(t("hub.messages.deviceQueryFailed"));
            throw error;
        } finally {
            setIsQueryingSerial(false);
        }
    }


    async function handleSaveDevice() {
        const values = await deviceForm.validateFields();
        setIsSaving(true);
        try {
            const selectedType = deviceTypes.find((item) => item.id === values.deviceTypeId);
            const candidate = {
                ...editingDevice,
                ...values,
                name: selectedType?.name || editingDevice?.name || ""
            };

            const savedDevice = await saveDevice(candidate);
            setDevices(loadDevices());
            setDeviceStatuses((current) => ({...current, [savedDevice.id]: "checking"}));
            setDeviceModalOpen(false);
            message.success(t(editingDevice ? "hub.messages.deviceUpdated" : "hub.messages.deviceAdded"));

            fetchDeviceInfoBySerial(savedDevice.serial)
                .then(async (deviceInfo) => {
                    if (!deviceInfo.ipAddress) throw new Error("DEVICE_IP_MISSING");
                    updateDeviceMetadata(savedDevice.id, {
                        ipAddress: deviceInfo.ipAddress,
                        type: deviceInfo.type || savedDevice.type,
                        plateSerial: deviceInfo.plateSerial || savedDevice.plateSerial,
                        lastIpCheckAt: new Date().toISOString(),
                        lastIpCheckStatus: "success"
                    });
                    setDevices(loadDevices());
                    await fetchDeviceInfoByIp(deviceInfo.ipAddress);
                    setDeviceStatuses((current) => ({...current, [savedDevice.id]: "active"}));
                })
                .catch(async () => {
                    updateDeviceMetadata(savedDevice.id, {
                        lastIpCheckAt: new Date().toISOString(),
                        lastIpCheckStatus: "failed"
                    });

                    if (savedDevice.ipAddress) {
                        try {
                            await fetchDeviceInfoByIp(savedDevice.ipAddress);
                            setDeviceStatuses((current) => ({...current, [savedDevice.id]: "active"}));
                            return;
                        } catch {
                            // وضعیت در ادامه غیرفعال می‌شود.
                        }
                    }

                    setDeviceStatuses((current) => ({...current, [savedDevice.id]: "inactive"}));
                    message.warning(t("hub.messages.deviceRegisteredQueryFailed"));
                });
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

    /** پیام پشتیبانی را فعلاً در نشست جاری نگه می‌دارد تا بعداً به API واقعی چت متصل شود. */
    function sendSupportMessage() {
        const text = chatText.trim();
        if (!text) return;
        setChatMessages((current) => [...current, {id: crypto.randomUUID(), text}]);
        setChatText("");
    }

    /** پیش از اجرای هر عملیات حساس دستگاه، تأیید صریح کاربر را دریافت می‌کند. */
    function confirmDeviceAction({title, danger = false, action}) {
        Modal.confirm({
            title,
            okText: t("common.confirm"),
            cancelText: t("common.cancel"),
            okButtonProps: {danger},
            onOk: action
        });
    }

    /** عملیات انتخاب‌شده را پس از تأیید اجرا و مودال تنظیمات پیشرفته را می‌بندد. */
    function runAdvancedAction(config) {
        setAdvancedDevice(null);
        confirmDeviceAction(config);
    }


    /**
     * TODO: بعد از آماده‌شدن API حساب کاربری، این تابع باید همه دستگاه‌هایی را دریافت کند
     * که حساب واردشده مالک آن‌هاست؛ پاسخ آینده شامل تمام فیلدهای کامل هر دستگاه خواهد بود.
     */
    async function refreshBaseInformation() {
        setIsRefreshing(true);
        try {
            message.info(t("hub.messages.baseInfoApiPending"));
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

    async function runDeviceOpen(device, openMode) {
        const key = `${device.id}:${openMode}`;
        setDeviceActionLoading((current) => ({...current, [key]: true}));
        try {
            await loginThenOpenDevice(device, openMode);
        } finally {
            setDeviceActionLoading((current) => ({...current, [key]: false}));
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
            setActivePanel("offline");
            setIsFrameReady(false);
            setIframeDevice({...device, panelUrl});
            beginFrameTimeout();
        } else {
            window.location.assign(panelUrl);
        }
    }

    const columns = useMemo(() => [
            {
                title: t("hub.table.device"),
                dataIndex: "name",
                key: "name",
                width: 120,
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
            {
                title: t("hub.table.status"),
                key: "status",
                width: 90,
                render: (_, device) => {
                    const status = deviceStatuses[device.id] || "checking";
                    const color = status === "active" ? "green" : status === "inactive" ? "red" : "gold";
                    return <Tag color={color}>{t(`hub.deviceStatus.${status}`)}</Tag>;
                }
            },
            {
                title: t("hub.table.actions"),
                key: "actions",
                width: 132,
                render: (_, device) =>
                    <Space size="middle" wrap={false}>
                        <Tooltip title={t("hub.actions.iframe")}>
                            <Button type="text" className="text-lg" icon={<DesktopOutlined/>}
                                    loading={deviceActionLoading[`${device.id}:iframe`]}
                                    disabled={deviceActionLoading[`${device.id}:direct`]}
                                    onClick={() => runDeviceOpen(device, "iframe")}/>
                        </Tooltip>
                        <Tooltip title={t("hub.actions.direct")}>
                            <Button type="text" className="text-lg" icon={<LinkOutlined/>}
                                    loading={deviceActionLoading[`${device.id}:direct`]}
                                    disabled={deviceActionLoading[`${device.id}:iframe`]}
                                    onClick={() => runDeviceOpen(device, "direct")}/>
                        </Tooltip>
                        <Tooltip title={t("hub.actions.advancedSettings")}>
                            <Button type="text" className="text-lg" icon={<SettingOutlined/>}
                                    onClick={() => setAdvancedDevice(device)}/>
                        </Tooltip>
                    </Space>

            }],
        [t, deviceActionLoading, deviceStatuses]);

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
                        loading={isRefreshing}
                        onClick={refreshBaseInformation}>

                        {t("hub.receiveBaseInfo")}
                    </Button>
                    <LanguageSwitcher/>
                    <ThemeToggle/>
                </div>
            </header>

            <main className="mx-auto  max-w-6xl space-y-5 px-4 pt-5 sm:px-6">

                <Button
                    block
                    className="sm:hidden"
                    loading={isRefreshing}
                    onClick={refreshBaseInformation}>

                    {t("hub.receiveBaseInfo")}
                </Button>

                <CollapsibleSection
                    icon={<PlayCircleOutlined/>}
                    title={t("hub.tutorial.title")}
                    description={t("hub.tutorial.description")}>
                    <Carousel arrows dots draggable={false} infinite={false}>
                        {TUTORIAL_SLIDES.map((slide, index) =>
                            <TutorialSlide key={slide.id} slide={slide} index={index} t={t}/>
                        )}
                    </Carousel>
                </CollapsibleSection>

                <CollapsibleSection
                    icon={<AppstoreOutlined/>}
                    title={t("hub.usefulApps.title")}
                    description={t("hub.usefulApps.description")}>
                    <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                        {[1, 2, 3, 4].map((item) =>
                            <div key={item}
                                 className="rounded-2xl border border-dashed border-slate-300 p-5 text-center dark:border-slate-700">
                                <AppstoreOutlined className="text-3xl text-brand-500"/>
                                <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    {t("hub.usefulApps.placeholder", {number: item})}
                                </p>
                            </div>
                        )}
                    </div>
                </CollapsibleSection>

                <CollapsibleSection
                    icon={<ApiOutlined/>}
                    title={t("hub.deviceManagement.title")}
                    description={t("hub.deviceManagement.description")}>
                    <div className="flex justify-center border-b border-slate-100 p-4 dark:border-slate-800 sm:p-5">
                        <Radio.Group
                            value={activePanel}
                            buttonStyle="solid"
                            onChange={(event) => setActivePanel(event.target.value)}>
                            <Radio.Button value="online">
                                <CloudOutlined className="me-2"/>
                                {t("hub.onlinePanel.title")}
                            </Radio.Button>
                            <Radio.Button value="offline">
                                <ApiOutlined className="me-2"/>
                                {t("hub.offlinePanel.title")}
                            </Radio.Button>
                        </Radio.Group>
                    </div>

                    {activePanel === "online" ?
                        <div className="p-4 sm:p-5">
                            <article
                                className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <div
                                    className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-brand-50 text-2xl text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                                    <CloudOutlined/>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="font-bold text-slate-800 dark:text-white">{t("hub.onlinePanel.title")}</h2>
                                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{t("hub.onlinePanel.description")}</p>
                                    {hasOnlineCredentials &&
                                        <Tag className="mt-2" color="green">{t("hub.onlinePanel.saved")}</Tag>}
                                </div>
                                <Space direction="vertical" size="small">
                                    <Button type="primary" icon={<DesktopOutlined/>}
                                            loading={onlineActionLoading === "iframe"}
                                            disabled={onlineActionLoading === "direct"}
                                            onClick={() => requestOnlineOpen("iframe")}>
                                        {t("hub.actions.iframe")}
                                    </Button>
                                    <Button icon={<LinkOutlined/>}
                                            loading={onlineActionLoading === "direct"}
                                            disabled={onlineActionLoading === "iframe"}
                                            onClick={() => requestOnlineOpen("direct")}>
                                        {t("hub.actions.direct")}
                                    </Button>
                                    {hasOnlineCredentials &&
                                        <Button type="link" icon={<EditOutlined/>} onClick={openOnlineLogin}>
                                            {t("hub.onlinePanel.editCredentials")}
                                        </Button>
                                    }
                                </Space>
                            </article>
                        </div> :
                        <>
                            <div className="p-4 sm:p-5">
                                <PanelCard
                                    icon={<ApiOutlined/>}
                                    title={t("hub.offlinePanel.title")}
                                    description={t("hub.offlinePanel.description")}
                                    buttonText={t("hub.addDevice")}
                                    onClick={openAddDevice}/>
                            </div>
                            <div className="border-t border-slate-100 dark:border-slate-800">
                                <div className="p-4 sm:p-5">
                                    <h3 className="font-bold text-slate-800 dark:text-white">{t("hub.deviceList")}</h3>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("hub.deviceListDescription")}</p>
                                </div>
                                <Table rowKey="id" columns={columns} dataSource={devices} pagination={false}
                                       tableLayout="fixed"
                                       scroll={{x: 422}}
                                       locale={{emptyText: <Empty description={t("hub.emptyDevices")}/>}}/>
                            </div>
                        </>}

                    {iframeDevice &&
                        ((activePanel === "online" && iframeDevice.isOnlinePanel) ||
                            (activePanel === "offline" && !iframeDevice.isOnlinePanel)) &&
                        <section
                            className="overflow-hidden border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                            <div
                                className="flex items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-700">
                                <div className="min-w-0">
                                    <h2 className="truncate font-semibold text-slate-800 dark:text-white">{iframeDevice.name}</h2>
                                    <p className="truncate text-xs text-slate-400" dir="ltr">
                                        {iframeDevice.panelUrl || buildDeviceBaseUrl(iframeDevice)}
                                    </p>
                                </div>
                                <Button onClick={() => setIframeDevice(null)}>{t("common.close")}</Button>
                            </div>
                            <iframe
                                id={iframeDevice.isOnlinePanel ? "online-panel-frame" : undefined}
                                src={iframeDevice.panelUrl || buildDeviceBaseUrl(iframeDevice)}
                                title={iframeDevice.name}
                                onLoad={handlePanelFrameLoad}
                                onError={handlePanelFrameError}
                                className={isFrameReady ?
                                    "block h-[65vh] min-h-[420px] w-full bg-white" :
                                    "invisible h-0 w-full"}/>
                            {!isFrameReady &&
                                <div className="flex min-h-[220px] items-center justify-center text-slate-500">
                                    {t("common.loading")}
                                </div>}
                        </section>}
                </CollapsibleSection>

                <div className="md:hidden "><PersianDateTime/></div>

            </main>

            {/*<button*/}
            {/*    type="button"*/}
            {/*    aria-label={t("hub.support.open")}*/}
            {/*    onClick={() => setChatOpen(true)}*/}
            {/*    className="fixed bottom-6 end-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-2xl text-white shadow-xl shadow-brand-500/30 transition hover:bg-brand-600">*/}
            {/*    <MessageOutlined/>*/}
            {/*</button>*/}

            <Modal title={t("hub.support.title")} open={chatOpen} footer={null}
                   onCancel={() => setChatOpen(false)}>
                <div className="mb-4 h-64 overflow-y-auto rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                    {chatMessages.length === 0 ?
                        <Empty description={t("hub.support.empty")}/> :
                        <div className="space-y-3">
                            {chatMessages.map((item) =>
                                <div key={item.id}
                                     className="ms-auto max-w-[85%] rounded-2xl rounded-ee-sm bg-brand-500 px-4 py-2 text-sm text-white">
                                    {item.text}
                                </div>
                            )}
                        </div>
                    }
                </div>
                <Space.Compact block>
                    <Input value={chatText} placeholder={t("hub.support.placeholder")}
                           onChange={(event) => setChatText(event.target.value)}
                           onPressEnter={sendSupportMessage}/>
                    <Button type="primary" icon={<MessageOutlined/>} onClick={sendSupportMessage}>
                        {t("hub.support.send")}
                    </Button>
                </Space.Compact>
                <p className="mt-2 text-xs text-slate-400">{t("hub.support.demoHint")}</p>
            </Modal>

            <Modal title={t("hub.advanced.title")} open={Boolean(advancedDevice)} footer={null}
                   onCancel={() => setAdvancedDevice(null)}>
                {advancedDevice &&
                    <div className="grid gap-3">
                        <Button icon={<EditOutlined/>}
                                onClick={() => openEditDevice(advancedDevice)}>{t("hub.actions.edit")}</Button>
                        <Button danger icon={<DeleteOutlined/>} onClick={() => runAdvancedAction({
                            title: t("hub.actions.deleteConfirm"),
                            danger: true,
                            action: () => handleDeleteDevice(advancedDevice.id)
                        })}>{t("hub.actions.delete")}</Button>
                    </div>
                }
            </Modal>

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
                        <Input autoComplete="username" placeholder={t("hub.placeholders.username")}/>
                    </Form.Item>
                    <Form.Item name="password" label={t("hub.fields.password")} rules={[{required: true}]}>
                        <Input.Password autoComplete="current-password" placeholder={t("hub.placeholders.password")}/>
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
                    <Form.Item
                        name="deviceTypeId"
                        label={t("hub.fields.deviceType")}
                        rules={[{required: true, message: t("hub.deviceForm.deviceTypeRequired")}]}>
                        <Select
                            loading={isLoadingDeviceTypes}
                            placeholder={t("hub.placeholders.deviceType")}
                            options={deviceTypes.map((item) => ({value: item.id, label: item.name}))}/>
                    </Form.Item>
                    <Form.Item
                        label={t("hub.fields.serial")}>
                        <Space.Compact block>
                            <Form.Item name="serial" noStyle rules={[{required: true}]}>
                                <Input dir="ltr" placeholder="SN404023"/>
                            </Form.Item>
                            <Button loading={isQueryingSerial} onClick={() => queryDeviceBySerial()}>
                                {t("hub.deviceForm.query")}
                            </Button>
                        </Space.Compact>
                    </Form.Item>
                    <Form.Item name="installationLocation" label={t("hub.fields.installationLocation")}>
                        <Input placeholder={t("hub.placeholders.installationLocation")}/>
                    </Form.Item>
                    <Form.Item
                        name="ipAddress"
                        label={t("hub.fields.ipAddress")}
                        extra={t("hub.deviceForm.ipHint")}
                        rules={[
                            () => ({
                                validator(_, value) {
                                    return !value || isValidIpv4(value) ? Promise.resolve() :
                                        Promise.reject(new Error(t("hub.deviceForm.ipInvalid")));
                                }
                            })
                        ]}>
                        <Input dir="ltr" placeholder="192.168.4.1"/>
                    </Form.Item>
                    <Form.Item name="username" label={t("hub.fields.username")}>
                        <Input autoComplete="username" placeholder={t("hub.placeholders.username")}/>
                    </Form.Item>
                    <Form.Item name="password" label={t("hub.fields.password")}>
                        <Input.Password autoComplete="new-password" placeholder={t("hub.placeholders.password")}/>
                    </Form.Item>
                    <Form.Item name="type" hidden><Input/></Form.Item>
                    <Form.Item name="plateSerial" hidden><Input/></Form.Item>
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

/** یک سکشن جمع‌شونده می‌سازد که در شروع بسته است و محتوای سنگین را فقط هنگام بازشدن نمایش می‌دهد. */
function CollapsibleSection({icon, title, description, children}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <section
            className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <button type="button" onClick={() => setIsOpen((current) => !current)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-3 p-4 text-start sm:p-5">
                <span
                    className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-brand-50 text-xl text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                    {icon}
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block font-bold text-slate-800 dark:text-white">{title}</span>
                    <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{description}</span>
                </span>
                <span className={`text-xl text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}>⌄</span>
            </button>
            {isOpen && <div className="border-t border-slate-100 dark:border-slate-800">{children}</div>}
        </section>
    );
}

/** اسلاید آموزشی را به‌صورت iframe آپارات یا جای‌نگهدار قابل‌تعویض نمایش می‌دهد. */
function TutorialSlide({slide, index, t}) {
    if (slide.aparatUrl) {
        return (
            <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                <iframe
                    src={slide.aparatUrl}
                    title={t("hub.tutorial.slideTitle", {number: index + 1})}
                    loading="eager"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"/>
            </div>
        );
    }

    return (
        <div
            className="flex aspect-video max-h-[520px] w-full flex-col items-center justify-center gap-3 bg-slate-950 px-6 text-center text-slate-300">
            <PlayCircleOutlined className="text-5xl text-brand-400"/>
            <p className="font-semibold">{t("hub.tutorial.slideTitle", {number: index + 1})}</p>
            <p className="max-w-lg text-sm">{t("hub.tutorial.placeholder")}</p>
        </div>
    );
}
