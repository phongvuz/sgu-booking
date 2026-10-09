export default function TravelRoadmap() {
  const steps = [
    {
      title: "Lên kế hoạch",
      desc: "Lựa chọn tuyến đường, giờ chạy và vị trí ghế yêu thích",
      icon: (
        <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
    },
    {
      title: "An toàn",
      desc: "Bảo hiểm hành khách trọn vẹn & xe đời mới bảo dưỡng nghiêm ngặt",
      icon: (
        <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: "Trải nghiệm",
      desc: "Tận hưởng không gian tiện nghi, wifi, nước uống và cảnh đẹp",
      icon: (
        <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: "Lưu kỷ niệm",
      desc: "Lưu lại những khoảnh khắc tuyệt vời và kết nối những miền đất mới",
      icon: (
        <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-brand-bg via-[#EBF5F1] to-[#E3EFEA]">
      {/* Botanical Palm Fronds Decorative (Bottom Left) */}
      <div className="absolute -bottom-10 -left-10 w-72 h-72 opacity-25 pointer-events-none text-brand-primary">
        <svg viewBox="0 0 200 200" fill="currentColor">
          <path d="M40 200 C60 160 80 120 120 80 C100 70 80 90 50 110 C30 120 20 140 10 170 Z" />
          <path d="M70 190 C90 140 120 100 160 70 C140 60 110 80 80 110 C60 130 50 160 40 180 Z" opacity="0.7" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative">
          {/* Curved Dotted Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-9 left-16 right-16 z-0 pointer-events-none">
            <svg
              className="w-full h-16"
              viewBox="0 0 900 60"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M 10 30 Q 225 5 450 30 T 880 30"
                stroke="var(--color-brand-primary)"
                strokeWidth="2.5"
                strokeDasharray="6 7"
                strokeOpacity="0.45"
              />
              {/* Flight plane icon on trajectory */}
              <g transform="translate(860, 22) rotate(10)">
                <path
                  d="M14 0 L18 16 L3 13 L0 11 L9 9 L5 2 Z"
                  fill="var(--color-brand-primary)"
                />
              </g>
            </svg>
          </div>

          {/* 4 Steps Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 relative z-10">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center group"
              >
                {/* Outer Ring & Circle Badge */}
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white border-2 border-[#D3E8E1] group-hover:border-brand-primary flex items-center justify-center shadow-lg shadow-teal-900/10 group-hover:scale-110 group-hover:shadow-teal-900/20 transition-all duration-300 relative">
                  <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#EBF5F1] group-hover:bg-[#E1EFEA] flex items-center justify-center transition-colors">
                    {step.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-base sm:text-lg text-brand-text mt-4 mb-1 group-hover:text-brand-primary transition-colors">
                  {step.title}
                </h3>

                {/* Subtitle description */}
                <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed hidden sm:block">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
