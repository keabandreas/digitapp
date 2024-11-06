import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: 
          "border-transparent bg-green-500 text-white hover:bg-green-600",
        warning:
          "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        info:
          "border-transparent bg-blue-500 text-white hover:bg-blue-600",
        ghost:
          "border-transparent bg-background/30 text-foreground backdrop-blur-sm",
        premium: 
          "border-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.25 text-xs",
        lg: "px-3 py-0.75 text-sm",
        xl: "px-4 py-1 text-base"
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
        spin: "animate-spin",
        ping: "animate-ping"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none"
    },
  }
);

const Badge = React.forwardRef(({ 
  className, 
  variant, 
  size,
  animation,
  icon: Icon,
  children,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(badgeVariants({ variant, size, animation }), className)}
      {...props}
    >
      {Icon && (
        <Icon className="w-3 h-3 mr-1" />
      )}
      {children}
    </div>
  );
});

Badge.displayName = "Badge";

export { Badge, badgeVariants };

// Example usage
const ExampleBadges = () => {
  return (
    <div className="flex gap-2 flex-wrap">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="premium">Premium</Badge>
      
      {/* Sizes */}
      <Badge size="sm">Small</Badge>
      <Badge size="default">Default</Badge>
      <Badge size="lg">Large</Badge>
      <Badge size="xl">Extra Large</Badge>
      
      {/* Animations */}
      <Badge animation="pulse">Pulse</Badge>
      <Badge animation="bounce">Bounce</Badge>
      <Badge animation="ping">Ping</Badge>
      
      {/* With Icons */}
      <Badge icon={Star}>With Icon</Badge>
      <Badge variant="premium" icon={Crown}>Premium</Badge>
    </div>
  );
};

export default ExampleBadges;