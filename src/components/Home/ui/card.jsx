import React from "react";
import clsx from "clsx";

// Base Card container
export function Card({ className, children, ...props }) {
  return (
    <div
      className={clsx(
        "bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition hover:shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Card Header
export function CardHeader({ className, children, ...props }) {
  return (
    <div className={clsx("px-6 pt-6 pb-2", className)} {...props}>
      {children}
    </div>
  );
}

// Card Title
export function CardTitle({ className, children, ...props }) {
  return (
    <h2
      className={clsx("text-2xl font-bold text-gray-800", className)}
      {...props}
    >
      {children}
    </h2>
  );
}

// Card Content
export function CardContent({ className, children, ...props }) {
  return (
    <div className={clsx("px-6 pb-6", className)} {...props}>
      {children}
    </div>
  );
}

// Card Footer
export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={clsx("px-6 py-4 bg-gray-50 border-t border-gray-100", className)}
      {...props}
    >
      {children}
    </div>
  );
}
