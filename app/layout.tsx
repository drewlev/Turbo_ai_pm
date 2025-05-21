import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Turbo Task Management",
  description: "Task management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          cardFooter: "hidden",
        },
      }}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* <SidebarProvider> */}
          {/* <AppSidebar /> */}
          {/* <SidebarInset className="bg-[#181921] text-[#d2d3e0]"> */}
          {children}
          {/* </SidebarInset> */}
          {/* </SidebarProvider> */}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
