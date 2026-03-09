import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-white/10 text-text py-12 mt-16 relative overflow-hidden">
      {/* Luz/Glow decorativo no footer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center">
          {/* Brand & Trust Section */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-accent mb-2">RubRhythm</h3>
            <p className="text-text/80 text-sm max-w-prose mx-auto leading-relaxed mb-4">
              Your trusted directory for professional massage and body rub services across America.
              We are committed to providing a safe, reliable platform connecting verified providers with respectful clients.
            </p>

            {/* Trust Signals */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                SSL Secured
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.682 2 6.35 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                </svg>
                Verified Providers Available
              </div>
            </div>
          </div>

          {/* Links with Fitts' Law compliance (min-height/paddings for tap targets) */}
          <nav className="flex flex-wrap justify-center items-center gap-x-4 gap-y-4 mb-8">
            <Link href="/view-cities" className="hover:text-accent transition-colors duration-200 text-sm whitespace-nowrap px-4 py-2 hover:bg-white/5 rounded-lg flex items-center justify-center min-h-[44px]">
              View Cities
            </Link>
            <Link href="/info/law-and-legal" className="hover:text-accent transition-colors duration-200 text-sm whitespace-nowrap px-4 py-2 hover:bg-white/5 rounded-lg flex items-center justify-center min-h-[44px]">
              Law & Legal
            </Link>
            <Link href="/info/anti-trafficking" className="hover:text-accent transition-colors duration-200 text-sm whitespace-nowrap px-4 py-2 hover:bg-white/5 rounded-lg flex items-center justify-center min-h-[44px]">
              Anti-Trafficking
            </Link>
            <Link href="/info/anti-scam" className="hover:text-accent transition-colors duration-200 text-sm whitespace-nowrap px-4 py-2 hover:bg-white/5 rounded-lg flex items-center justify-center min-h-[44px]">
              Anti-Scam Guide
            </Link>
            <Link href="/info/section-2257" className="hover:text-accent transition-colors duration-200 text-sm whitespace-nowrap px-4 py-2 hover:bg-white/5 rounded-lg flex items-center justify-center min-h-[44px]">
              Section 2257
            </Link>
            <Link href="/info/terms" className="hover:text-accent transition-colors duration-200 text-sm whitespace-nowrap px-4 py-2 hover:bg-white/5 rounded-lg flex items-center justify-center min-h-[44px]">
              Terms
            </Link>
            <Link href="/info/faq" className="hover:text-accent transition-colors duration-200 text-sm whitespace-nowrap px-4 py-2 hover:bg-white/5 rounded-lg flex items-center justify-center min-h-[44px]">
              FAQ
            </Link>
            <Link href="/info/get-help-from-staff" className="hover:text-accent transition-colors duration-200 text-sm whitespace-nowrap px-4 py-2 hover:bg-white/5 rounded-lg flex items-center justify-center min-h-[44px]">
              Get Help From Staff
            </Link>
            <Link href="/letter-from-staff" className="hover:text-accent transition-colors duration-200 text-sm whitespace-nowrap px-4 py-2 hover:bg-white/5 rounded-lg flex items-center justify-center min-h-[44px]">
              View Letter
            </Link>
            <Link href="/info/privacy-policy" className="hover:text-accent transition-colors duration-200 text-sm whitespace-nowrap px-4 py-2 hover:bg-white/5 rounded-lg flex items-center justify-center min-h-[44px]">
              Privacy Policy
            </Link>
            <Link href="/get-verified" className="hover:text-accent transition-colors duration-200 text-sm font-medium text-primary whitespace-nowrap px-4 py-2 border border-primary/30 hover:bg-primary/10 rounded-lg flex items-center justify-center min-h-[44px]">
              Get Verified Profile
            </Link>
          </nav>

          {/* Copyright */}
          <div className="text-center pt-4 border-t border-text/20 w-full">
            <p className="text-text/60 text-xs">
              © 2026 RubRhythm. All rights reserved. Professional massage directory.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}