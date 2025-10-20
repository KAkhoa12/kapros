import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "AI Models | Kapros - AI Demo CV",
  description:
    "Explore our AI models for face-to-comic and comic-to-face transformations",
};

// Mảng gradient đẹp giống kiểu iPhone
const gradients = [
  'from-purple-500 via-purple-600 to-blue-500',
  'from-cyan-500 to-blue-500',
  'from-green-400 to-blue-500',
  'from-yellow-400 via-red-500 to-pink-500',
  'from-indigo-500 via-purple-500 to-pink-500',
  'from-blue-500 to-teal-500',
  'from-pink-500 to-rose-500',
  'from-amber-500 to-orange-500',
  'from-red-500 to-yellow-500',
  'from-green-500 to-teal-500'
];

// Hàm băm đơn giản để chọn gradient cố định dựa trên tên model
function simpleHash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

const models = [
  {
    name: "Face2Comic",
    description: "Transform your photos into stunning comic-style illustrations using our advanced AI model.",
    image: "",
    link: "/models/face2comic",
  },
  {
    name: "Comic2Face",
    description: "Transform your comic-style illustrations into realistic face images using our advanced AI model.",
    image: "",
    link: "/models/comic2face",
  },
];

const ModelsPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="AI Models"
        description="Transform your images with our advanced AI models. Convert faces to comics or comics to realistic faces."
      />

      <section className="relative z-10 py-16 md:py-20 lg:py-28 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {models.map((model, index) => {
              // Chọn gradient dựa trên tên model để đảm bảo tính nhất quán
              const gradientIndex = simpleHash(model.name) % gradients.length;
              const gradientClass = gradients[gradientIndex];
              
              return (
                <div 
                  key={index}
                  className="group bg-gray-900 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-gray-800"
                >
                  <div className="relative h-64 overflow-hidden">
                    {model.image ? (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Image 
                          src={model.image} 
                          alt={model.name} 
                          width={100}
                          height={100}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full z-20">
                          AI MODEL
                        </div>
                      </>
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradientClass} animate-gradient`}>
                        <h3 className="text-3xl font-bold text-white text-center px-4 drop-shadow-lg">
                          {model.name}
                        </h3>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">
                      <Link href={model.link}> {model.name} </Link>
                    </h3>
                    <p className="text-gray-400 mb-5">
                      {model.description}
                    </p>
                    
                    <Link 
                      href={model.link}
                      className="inline-flex items-center text-blue-400 font-medium group-hover:text-blue-300 transition-colors duration-300"
                    >
                      Explore Model
                      <svg 
                        className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-16 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Transform Your Images?</h2>
            <p className="text-gray-400 mb-6">
              Try our AI models today and experience the magic of advanced image transformation technology.
            </p>
            <Link 
              href="/contact"
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
      
      {/* <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
      `}</style> */}
    </>
  );
};

export default ModelsPage;