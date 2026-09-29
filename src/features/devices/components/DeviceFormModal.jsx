import React from "react";
import {Button, Form, Input, Modal, Space} from "antd";


export const EMPTY_DEVICE = {
    serial: "",
    installationLocation: "",
    type: "",
    plateSerial: "",
    ipAddress: "",
    username: "",
    password: ""
};


function isValidIpv4(value) {
    const parts = String(value || "").trim().split(".");
    return parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}


/** فرم افزوده/ویرایش دستگاه؛ منطق ذخیره و استعلام در hook یا صفحهٔ والد می‌ماند. */
export default function DeviceFormModal({
    form,
    editingDevice,
    isOpen,
    isSaving,
    isQuerying,
    onCancel,
    onQuery,
    onSubmit,
    t
}) {
    return (
        <Modal
            centered
            title={t(editingDevice ? "hub.deviceForm.editTitle" : "hub.deviceForm.addTitle")}
            open={isOpen}
            confirmLoading={isSaving}
            okText={t("common.confirm")}
            cancelText={t("common.cancel")}
            onOk={onSubmit}
            onCancel={onCancel}
            destroyOnClose>

            <Form form={form} layout="vertical" initialValues={EMPTY_DEVICE}>
                <Form.Item label={t("hub.fields.serial")}>
                    <Space.Compact block>
                        <Form.Item required name="serial" noStyle rules={[{required: true}]}>
                            <Input dir="ltr" placeholder="SN404023"/>
                        </Form.Item>
                        <Button loading={isQuerying} onClick={onQuery}>
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
    );
}
