export default function SocialIcons() {
  return (
    <footer className="flex gap-4 justify-center py-4">
      <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
        <picture>
          <source srcSet="/icons/github.webp" type="image/webp" />
          <img src="/icons/github.svg" alt="GitHub" className="w-6 h-6" loading="lazy" />
        </picture>
      </a>
      <a href="https://instagram.com/yourusername" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
        <picture>
          <source srcSet="/icons/instagram.webp" type="image/webp" />
          <img src="/icons/instagram.svg" alt="Instagram" className="w-6 h-6" loading="lazy" />
        </picture>
      </a>
      {/* Add more as needed */}
    </footer>
  );
} 