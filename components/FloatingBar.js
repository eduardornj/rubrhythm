"use client";

import Link from "next/link";
import useFilterStore from "../store/useFilterStore";

export default function FloatingBar() {
  const { onlyVerified, toggleOnlyVerified } = useFilterStore();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 px-4 py-2 flex justify-between items-center shadow-2xl z-50 h-12">
      <div className="flex items-center space-x-6">
        <Link href="/letter-from-staff" className="text-gray-300 hover:text-white text-sm transition-colors duration-200">
          Letter From The Staff
        </Link>
        <Link href="/info/terms" className="text-gray-300 hover:text-white text-sm transition-colors duration-200">
          Terms
        </Link>
        <Link href="/info/law-and-legal" className="text-gray-300 hover:text-white text-sm transition-colors duration-200">
          Law & Legal
        </Link>
        <Link href="/info/get-help-from-staff" className="text-gray-300 hover:text-white text-sm transition-colors duration-200">
          Get Help
        </Link>
      </div>
      <div className="flex items-center space-x-3">
        <span className="text-gray-300 text-sm">Only Verified</span>
        <button
          onClick={toggleOnlyVerified}
          className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${onlyVerified ? "bg-blue-600" : "bg-gray-600"
            }`}
          aria-label="Toggle verified profiles only"
        >
          <span
            className={`inline-block w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out ${onlyVerified ? "translate-x-5" : "translate-x-1"
              }`}
          />
        </button>
      </div>
    </div>
  );
}