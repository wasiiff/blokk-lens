import { Suspense } from "react"
import CoinDetailClient from "@/components/coins/CoinDetailClient"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { BorderBeam } from "@/components/ui/borderbeam"
import { Loader2 } from "lucide-react"

export default async function CoinDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 flex-col">
        <div className="relative mx-auto w-full max-w-(--breakpoint-xl) flex-1 border-dashed border-r border-l px-4 sm:px-8 overflow-hidden">
          <BorderBeam borderWidth={1} reverse initialOffset={10} className="from-transparent via-foreground/30 to-transparent"/>
          <BorderBeam borderWidth={1} className="from-transparent via-foreground/30 to-transparent"/>
          
          <div className="relative flex flex-col justify-start items-center w-full">
            <div className="w-full max-w-none px-2 sm:px-4 md:px-6 lg:px-8 lg:max-w-[1270px] relative flex flex-col justify-start items-start">
              <div className="self-stretch pt-[9px] overflow-hidden flex flex-col justify-center items-start relative z-10 w-full">
                <Navbar />

                <main className="w-full px-2 sm:px-0">
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-[60vh]">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    }
                  >
                    <CoinDetailClient coinId={id} />
                  </Suspense>
                </main>

                <Footer />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
