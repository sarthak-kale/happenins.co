import type React from "react";

export type AuthMode = "login" | "register" | "forgot_password" | "reset_password";
export type ResetStep = "enter_otp" | "set_password" | "success";
export type Setter<T> = React.Dispatch<React.SetStateAction<T>>;



