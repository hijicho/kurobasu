import logoImage from 'figma:asset/e52bb999d689900e37b9d134926cef87854ec798.png';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img 
              src={logoImage} 
              alt="クロバス" 
              className="h-8 w-auto"
            />
          </div>
          
          <div className="flex gap-6 text-sm">
            <a href="/terms" className="text-gray-600 hover:text-theme-primary transition-colors">
              利用規約
            </a>
            <a href="/privacy" className="text-gray-600 hover:text-theme-primary transition-colors">
              プライバシーポリシー
            </a>
            <a href="/contact" className="text-gray-600 hover:text-theme-primary transition-colors">
              お問い合わせ
            </a>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          © 2025 クロバス. All rights reserved.
        </div>
      </div>
    </footer>
  );
}