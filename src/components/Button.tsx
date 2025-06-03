import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export interface ButtonProps {
  as?: "button" | "a";
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  animate?: boolean;
  tooltip?: string;
  children?: React.ReactNode;
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
  disabled?: boolean;
  onClick?: (() => void) | ((e: React.MouseEvent) => void);
  "aria-label"?: string;
  title?: string;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  as = "button",
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = "left",
  animate = true,
  tooltip,
  className = "",
  disabled,
  children,
  href,
  target,
  rel,
  onClick,
  "aria-label": ariaLabel,
  title,
  type = "button",
}) => {
  const { colors } = useTheme();

  const baseClasses = [
    "inline-flex items-center justify-center",
    "font-medium transition-all duration-200 ease-out",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:opacity-60 disabled:cursor-not-allowed",
    "disabled:transform-none",
    "relative overflow-hidden",
    // Add consistent gap only when there are multiple elements
    children && icon ? "gap-2" : "",
    fullWidth && "w-full",
  ]
    .filter(Boolean)
    .join(" ");

  const getVariantStyles = () => {
    const styles = {
      primary: {
        background: `linear-gradient(135deg, ${colors.brand.primary}, ${colors.brand.secondary})`,
        color: colors.text.inverse,
        border: "none",
        boxShadow: `0 2px 8px ${colors.brand.primary}30`,
        borderRadius: "8px",
      },
      secondary: {
        background: colors.bg.elevated,
        color: colors.text.primary,
        border: `1px solid ${colors.border.primary}`,
        boxShadow: `0 1px 3px ${colors.bg.overlay}20`,
        borderRadius: "8px",
      },
      success: {
        background: `linear-gradient(135deg, ${colors.status.success}, #059669)`,
        color: colors.text.inverse,
        border: "none",
        boxShadow: `0 2px 8px ${colors.status.success}30`,
        borderRadius: "8px",
      },
      danger: {
        background: `linear-gradient(135deg, ${colors.status.error}, #dc2626)`,
        color: colors.text.inverse,
        border: "none",
        boxShadow: `0 2px 8px ${colors.status.error}30`,
        borderRadius: "8px",
      },
      ghost: {
        background: "transparent",
        color: colors.text.secondary,
        border: `1px solid transparent`,
        boxShadow: "none",
        borderRadius: "8px",
      },
      icon: {
        background: colors.bg.elevated,
        color: colors.text.secondary,
        border: `1px solid ${colors.border.primary}`,
        boxShadow: `0 1px 3px ${colors.bg.overlay}20`,
        borderRadius: "8px", // Changed from 50% to match other buttons
      },
    };
    return styles[variant] || styles.primary;
  };

  const variantStyle = getVariantStyles();

  // Fixed sizing - more consistent and practical
  const sizeClasses = {
    sm: variant === "icon" ? "w-8 h-8 p-0" : "px-3 py-1.5 text-sm min-h-[32px]",
    md: variant === "icon" ? "w-10 h-10 p-0" : "px-4 py-2 text-sm min-h-[40px]",
    lg:
      variant === "icon"
        ? "w-12 h-12 p-0"
        : "px-6 py-2.5 text-base min-h-[44px]",
    xl: variant === "icon" ? "w-14 h-14 p-0" : "px-8 py-3 text-lg min-h-[48px]",
  };

  const combinedClasses = [baseClasses, sizeClasses[size], className].join(" ");

  const buttonContent = (
    <>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && icon && iconPosition === "left" && (
        <span className="flex items-center justify-center">{icon}</span>
      )}
      {children && (
        <span
          className={`${
            loading ? "opacity-0" : "opacity-100"
          } transition-opacity duration-200`}
        >
          {children}
        </span>
      )}
      {!loading && icon && iconPosition === "right" && (
        <span className="flex items-center justify-center">{icon}</span>
      )}
    </>
  );

  const ButtonComponent = animate
    ? as === "a"
      ? motion.a
      : motion.button
    : as;
  const motionProps = animate
    ? {
        whileHover:
          disabled || loading
            ? {}
            : {
                scale: 1.02,
                boxShadow:
                  variant === "ghost"
                    ? "none"
                    : `0 4px 12px ${colors.brand.primary}40`,
              },
        whileTap: disabled || loading ? {} : { scale: 0.98 },
        transition: { type: "spring", stiffness: 400, damping: 25 },
      }
    : {};

  // Add hover styles for ghost variant
  const hoverStyles =
    variant === "ghost"
      ? {
          ":hover": {
            backgroundColor: `${colors.bg.elevated}80`,
            borderColor: colors.border.secondary,
          },
        }
      : {};

  const elementProps = {
    className: combinedClasses,
    style: { ...variantStyle, ...hoverStyles },
    "aria-label": tooltip || ariaLabel,
    title: title,
    onClick: onClick,
    ...(as === "a"
      ? { href, target, rel }
      : { disabled: disabled || loading, type }),
    ...motionProps,
  };

  const button = (
    <ButtonComponent {...elementProps}>{buttonContent}</ButtonComponent>
  );

  if (tooltip) {
    return (
      <div className="group relative inline-block">
        {button}
        <div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50"
          style={{
            background: colors.bg.elevated,
            color: colors.text.primary,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: `0 4px 12px ${colors.bg.overlay}30`,
          }}
        >
          {tooltip}
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent"
            style={{ borderTopColor: colors.bg.elevated }}
          ></div>
        </div>
      </div>
    );
  }

  return button;
};

Button.displayName = "Button";

export default Button;
