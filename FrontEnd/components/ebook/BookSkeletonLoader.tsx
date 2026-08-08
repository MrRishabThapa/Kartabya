"use client";

export default function BookSkeleton() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 px-4 py-4">

      {/* Title */}
      <div className="text-center shrink-0">
        <div className="h-10 w-96 max-w-[90%] mx-auto rounded shimmer" />
      </div>

      {/* Page Counter */}
      <div className="mt-4 mb-4">
        <div className="h-5 w-28 rounded shimmer" />
      </div>

      {/* Book Area */}
      <div className="flex-1 flex items-center p-5 justify-center overflow-hidden">

        <div
          className="
            relative
            bg-white
           
            
            rounded-3xl
            p-6
           
          "
        >

          {/* Left Spine */}
          <div
            className="
              absolute
              top-0
              bottom-0
              left-0
              w-1
             
            "
          />

          {/* Right Spine */}
          <div
            className="
              absolute
              top-0
              bottom-0
              right-0
              w-1
            
            "
          />

          {/* Page */}
          <div
            className="
              w-[520px]
              h-[620px]
              
              px-10
              py-12
              relative
            "
          >

            {/* Adaptiv Header */}
            <div className="h-4 w-28 rounded shimmer mb-10 mt-5" />

            {/* Paragraphs */}
            <div className="space-y-5">

              <div className="h-7 w-full rounded shimmer" />
              <div className="h-7 w-11/12 rounded shimmer" />
              <div className="h-7 w-full rounded shimmer" />
              <div className="h-7 w-10/12 rounded shimmer" />
              <div className="h-7 w-full rounded shimmer" />
              <div className="h-7 w-9/12 rounded shimmer" />
              <div className="h-7 w-full rounded shimmer" />
              <div className="h-7 w-8/12 rounded shimmer" />

            </div>

            
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between gap-4 mt-4 shrink-0">

        <div
          className="
            h-14
            w-64
            rounded-xl
            shimmer
          "
        />

        <div
          className="
            h-14
            w-64
            rounded-xl
            shimmer
          "
        />

      </div>
    </div>
  );
}
