import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <div class="fixed inset-0 bg-[#070b14]/70 flex flex-col items-center justify-center z-[100] backdrop-blur-md animate-fade-in">
      <div class="relative w-20 h-20 mb-4">
        <div class="absolute inset-0 border-4 border-[#007FFF]/20 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-[#007FFF] border-t-transparent rounded-full animate-spin"></div>
        <div class="absolute inset-2 border-4 border-[#D4AF37] border-b-transparent rounded-full animate-spin" style="animation-direction: reverse; animation-duration: 1.5s;"></div>
      </div>
      <p class="text-white font-bold tracking-widest text-sm uppercase">Cargando...</p>
      <p class="text-indigo-200/80 text-xs mt-2">Preparando experiencia premium</p>
    </div>
  `
})
export class LoaderComponent {}
