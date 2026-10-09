export const DESTINATIONS = [
  {
    id: "halong",
    tripDestination: "Hạ Long",
    large: true,
    title: "Vịnh Hạ Long",
    location: "Quảng Ninh",
    duration: "3 ngày",
    imageUrl: "/images/halong.jpg",

  },
  {
    id: "mucangchai",
    tripDestination: "Mù Cang Chải",
    large: false,
    title: "Mù Cang Chải",
    location: "Yên Bái",
    duration: "Mùa lúa chín",
    imageUrl: "/images/mucangchai.jpg",

  },
  {
    id: "phuquoc",
    tripDestination: "Phú Quốc",
    large: false,
    title: "Phú Quốc",
    location: "Kiên Giang",
    duration: "Biển & nghỉ dưỡng",
    imageUrl: "/images/phuquoc.jpg",

  },
];

export const GUIDES = [
  {
    id: "hagiang",
    title: "Hà Giang",
    subtitle: "Road trip 4 ngày",
    imageUrl: "/images/hagiang.jpg",
    link: "/trips?to=" + encodeURIComponent("Hà Giang"),
    iconBg: "bg-brand-light text-brand-primary",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15l4-8 4 6 5-10 5 12H3z" />
      </svg>
    ),
  },
  {
    id: "ninhbinh",
    title: "Ninh Bình",
    subtitle: "Đi chậm giữa di sản",
    imageUrl: "/images/ninhbinh.jpg",
    link: "/trips?to=" + encodeURIComponent("Ninh Bình"),
    iconBg: "bg-[#E2F0F3] text-[#0D6D7E]",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: "hoian",
    title: "Hội An",
    subtitle: "Ẩm thực & phố cổ",
    imageUrl: "/images/hoian.jpg",
    link: "/trips?to=" + encodeURIComponent("Hội An"),
    iconBg: "bg-[#F7EFE2] text-[#9A641A]",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

