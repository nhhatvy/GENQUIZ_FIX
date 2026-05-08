export default function Logo() {
  return (
    <div className="flex items-center gap-2 group cursor-pointer">
      <div className="relative transition-transform duration-300 group-hover:scale-110">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          className="drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]"
        >
          <defs>
            <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
              {/* Thay stopColor bằng var(--primary) để đổi màu theo hệ thống */}
              <stop offset="0%" stopColor="var(--primary)" />
              {/* Giữ lại một chút ánh hồng hoặc dùng màu primary nhạt hơn để tạo gradient */}
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Chat bubble */}
          <path
            d="M21 12c0 4.418-4.03 8-9 8-1.01 0-1.98-.15-2.87-.43L3 21l1.6-4.3C3.6 15.3 3 13.7 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            stroke="url(#logoGradient)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Smile */}
          <path
            d="M9 12c1.5 1.5 4.5 1.5 6 0"
            stroke="url(#logoGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Sparkle */}
          <path
            d="M18 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z"
            fill="url(#logoGradient)"
          />
        </svg>
      </div>

      {/* Text */}
      <span
        className="
          text-2xl
          font-bold
          tracking-tight
          transition-colors
          duration-300
          /* Sử dụng text-primary để đổi màu chữ theo hệ thống */
          text-primary
          /* Nếu bạn vẫn muốn gradient chữ, hãy dùng cách dưới đây */
          bg-gradient-to-br
          from-primary
          to-primary/60
          bg-clip-text
          text-transparent
        "
      >
        GenQuiz
      </span>
    </div>
  );
}