import styles from "./Card.module.css";
import { clsx } from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export default function Card({ children, className, hoverable = false, ...props }: CardProps) {
  return (
    <div 
      className={clsx(styles.card, hoverable && styles.hoverable, className)}
      {...props}
    >
      {children}
    </div>
  );
}
