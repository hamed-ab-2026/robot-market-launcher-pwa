import React from "react";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {describe, expect, it, vi} from "vitest";

import NumericKeypad from "./NumericKeypad";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: {resolvedLanguage: "en"}
    })
}));

describe("NumericKeypad", () => {
    it("appends digits and submits when the entered value reaches the required length", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        const onSubmit = vi.fn();

        const {rerender} = render(
            <NumericKeypad value="" onChange={onChange} onSubmit={onSubmit} length={2}/>
        );

        await user.click(screen.getByRole("button", {name: "1"}));
        expect(onChange).toHaveBeenLastCalledWith("1");

        rerender(<NumericKeypad value="12" onChange={onChange} onSubmit={onSubmit} length={2}/>);
        await user.click(screen.getByRole("button", {name: "common.confirm"}));

        expect(onSubmit).toHaveBeenCalledWith("12");
    });

    it("handles Backspace from the physical keyboard", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(<NumericKeypad value="12" onChange={onChange} length={4}/>);

        await user.keyboard("{Backspace}");

        expect(onChange).toHaveBeenCalledWith("1");
    });
});
