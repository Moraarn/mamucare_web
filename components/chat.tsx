"use client";

export default function MamuCareChat() {
  function openWhatsApp() {
  const phoneNumber = "254110944040";
  const message = "Hello MamuCare, I need assistance.";

  const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

  window.location.href = whatsappUrl;
}
  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <button
  onClick={openWhatsApp}
  aria-label="Chat with MamuCare on WhatsApp"
>
  {/* your WhatsApp icon */}
</button>
<button>
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.7 1.2 1.5 1.9 1 .9 1.9 1.2 2.2 1.3.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.2.1.8-.1 1.4z" />
        </svg>
      </button>
    </div>
  );
}