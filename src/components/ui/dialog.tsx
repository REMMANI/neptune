import * as React from "react"

export const Dialog = ({ children, ...props }: any) => <div {...props}>{children}</div>
export const DialogContent = ({ children, ...props }: any) => <div {...props}>{children}</div>
export const DialogDescription = ({ children, ...props }: any) => <div {...props}>{children}</div>
export const DialogHeader = ({ children, ...props }: any) => <div {...props}>{children}</div>
export const DialogTitle = ({ children, ...props }: any) => <h2 {...props}>{children}</h2>
export const DialogTrigger = ({ children, ...props }: any) => <div {...props}>{children}</div>