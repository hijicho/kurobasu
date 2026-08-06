import logoImage from '../assets/e52bb999d689900e37b9d134926cef87854ec798.png';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <img 
              src={logoImage.src}
              alt="クロバス" 
              className="h-8 w-auto"
            />
          </div>
        
          <div className="text-center text-sm text-gray-500">
            © 2026 クロバス. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
