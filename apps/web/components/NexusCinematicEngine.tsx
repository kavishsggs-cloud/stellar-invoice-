"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useWallet } from "../hooks/useWallet";
import { Button } from "./ui/button";
import { ArrowUpRight, Hexagon, ShieldCheck, Zap, Lock, Globe, Cpu, Sparkles, ArrowRight } from "lucide-react";

export default function NexusCinematicEngine() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { isConnected, connect } = useWallet();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // -------------------------------------------------------------
    // THREE.JS CANVAS & PARTICLE SPHERE ENGINE (Teal/White Additive Dots)
    // -------------------------------------------------------------
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Sphere Geometry Construction
    const particleCount = 1400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorTeal = new THREE.Color("#00827c");
    const colorTealGlow = new THREE.Color("#cbfffc");
    const colorWhite = new THREE.Color("#ffffff");

    for (let i = 0; i < particleCount; i++) {
      // Create sphere distribution
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 3.5 + (Math.random() - 0.5) * 1.5;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const rand = Math.random();
      const c = rand > 0.6 ? colorTealGlow : rand > 0.3 ? colorTeal : colorWhite;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      particles.rotation.y = elapsedTime * 0.05;
      particles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.06;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // -------------------------------------------------------------
    // GSAP 3.12.5 SCROLLTRIGGER TIMELINE
    // -------------------------------------------------------------
    const container = containerRef.current;
    if (container) {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: "#cinematic",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          pin: ".sticky-hero-frame",
        },
      });

      timeline.to("#lbTop, #lbBot", {
        height: "5vh",
        ease: "power2.inOut",
        duration: 0.2,
      }, 0);

      timeline.to(camera.position, {
        z: 2.2,
        ease: "none",
        duration: 1.0,
      }, 0);

      timeline.to("#heroStoryText", {
        opacity: 1,
        y: 0,
        duration: 0.3,
      }, 0.1);

      timeline.to("#heroStoryText", {
        opacity: 0,
        y: -30,
        duration: 0.2,
      }, 0.45);

      timeline.to("#heroDashboardPreview", {
        opacity: 1,
        scale: 1,
        duration: 0.3,
      }, 0.5);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="relative bg-[#012624] text-[#bbc7c6] overflow-hidden">
      
      {/* Three.js Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 w-full h-full"
      />

      {/* Surface 0 Wash Layer */}
      <div
        id="gradeWash"
        className="fixed inset-0 pointer-events-none z-0 opacity-30 bg-[radial-gradient(circle_at_center,rgba(0,130,124,0.18)_0%,rgba(1,38,36,0)_70%)]"
      />

      {/* Letterboxing Bars */}
      <div
        id="lbTop"
        className="fixed top-0 left-0 right-0 bg-[#011d1c] z-40 transition-all duration-300 pointer-events-none border-b border-[#cbfffc]/10"
        style={{ height: "0vh" }}
      />
      <div
        id="lbBot"
        className="fixed bottom-0 left-0 right-0 bg-[#011d1c] z-40 transition-all duration-300 pointer-events-none border-t border-[#cbfffc]/10"
        style={{ height: "0vh" }}
      />

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-5 flex items-center justify-between backdrop-blur-md border-b border-[#cbfffc]/10 bg-[#012624]/80">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-[6px] bg-[#003734] border border-[#cbfffc]/20 flex items-center justify-center">
            <Hexagon className="h-5 w-5 text-[#cbfffc] animate-spin-slow" />
          </div>
          <span className="text-xl font-medium tracking-tight text-[#ffffff]">AUROS TERMINAL</span>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-xs font-medium uppercase tracking-[0.12em] text-[#bbc7c6]">
          <a href="#collection" className="hover:text-[#ffffff] transition-colors">COLLECTION</a>
          <a href="#craft" className="hover:text-[#ffffff] transition-colors">CRAFT</a>
          <a href="#integration" className="hover:text-[#ffffff] transition-colors">SOROBAN</a>
          <a href="#noema-manifesto" className="hover:text-[#ffffff] transition-colors">MANIFESTO</a>
          <a href="#noema-board" className="hover:text-[#ffffff] transition-colors">ANALYTICS</a>
        </div>

        <div className="flex items-center space-x-4">
          {!isConnected ? (
            <Button
              onClick={connect}
              className="bg-[linear-gradient(90deg,#cbfffc_0%,#edfffe_26.25%,#fffdfa_47.57%,#fad1ff_88.96%)] text-[#011d1c] font-medium text-[13px] uppercase tracking-[0.05em] rounded-[6px] px-6 py-2.5 hover:opacity-90 shadow-none border-0"
            >
              CONNECT FREIGHTER
            </Button>
          ) : (
            <Link href="/dashboard">
              <Button
                className="bg-[linear-gradient(90deg,#cbfffc_0%,#edfffe_26.25%,#fffdfa_47.57%,#fad1ff_88.96%)] text-[#011d1c] font-medium text-[13px] uppercase tracking-[0.05em] rounded-[6px] px-6 py-2.5 hover:opacity-90 shadow-none border-0"
              >
                ENTER DASHBOARD <ArrowRight size={14} className="ml-1.5 inline" />
              </Button>
            </Link>
          )}
        </div>
      </nav>

      {/* SECTION 1: #cinematic */}
      <div id="cinematic" ref={containerRef} className="relative h-[650vh] z-10">
        <div className="sticky-hero-frame sticky top-0 h-screen w-full flex flex-col items-center justify-center px-6 overflow-hidden">
          
          <div id="heroStoryText" className="text-center max-w-4xl opacity-100 transform translate-y-0 transition-all duration-500 z-20">
            <div className="mb-6 inline-flex items-center space-x-2 text-[12px] font-medium uppercase tracking-[0.12em] text-[#edfffe] px-4 py-1.5 rounded-[6px] bg-[#003734] border border-[#cbfffc]/15">
              <Sparkles size={14} className="text-[#cbfffc]" />
              <span>LEVEL 4 STELLAR FINTECH TERMINAL</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-medium tracking-[-0.04em] text-[#ffffff] leading-[1.08]">
              Abyssal Soroban <br />
              <span className="text-[#cbfffc]">Financial Engine</span>
            </h1>

            <p className="mt-6 text-base md:text-lg text-[#bbc7c6] max-w-2xl mx-auto leading-[1.4]">
              Automated, non-custodial Soroban smart contract billing. Settle invoices globally in seconds with cryptographic proof.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/invoices/create">
                <Button className="bg-[linear-gradient(90deg,#cbfffc_0%,#edfffe_26.25%,#fffdfa_47.57%,#fad1ff_88.96%)] text-[#011d1c] font-medium text-[14px] uppercase tracking-[0.05em] rounded-[6px] px-8 py-3.5 hover:opacity-90 shadow-none border-0">
                  CREATE INVOICE REQUEST
                </Button>
              </Link>
              <a href="#collection">
                <Button className="bg-[#003734] text-[#ffffff] font-medium text-[14px] uppercase tracking-[0.05em] rounded-[6px] px-8 py-3.5 hover:bg-[#003734]/80 border border-[#cbfffc]/20 shadow-none">
                  EXPLORE ARCHITECTURE
                </Button>
              </a>
            </div>
          </div>

          {/* Interactive Dashboard Preview Frame */}
          <div
            id="heroDashboardPreview"
            className="absolute inset-x-6 bottom-12 max-w-5xl mx-auto opacity-0 scale-95 transition-all duration-700 pointer-events-auto z-30"
          >
            <div className="bg-[#003734] rounded-[16px] p-8 border border-[#cbfffc]/15 shadow-none text-left">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#cbfffc]/10">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-[#00827c]" />
                  <div className="h-3 w-3 rounded-full bg-[#cbfffc]" />
                  <div className="h-3 w-3 rounded-full bg-[#fde9ff]" />
                  <span className="text-xs font-mono text-[#bbc7c6]/70 ml-2">soroban_invoice_contract.wasm</span>
                </div>
                <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#edfffe] px-3 py-1 bg-[#012624] rounded-[6px] border border-[#cbfffc]/20">
                  STELLAR TESTNET LIVE
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 bg-[#012624] rounded-[12px] border border-[#cbfffc]/10">
                  <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#edfffe]">Settled Balance</p>
                  <p className="text-3xl font-medium text-[#fde9ff] mt-2">124,500.00 <span className="text-xs text-[#bbc7c6]">XLM</span></p>
                </div>
                <div className="p-5 bg-[#012624] rounded-[12px] border border-[#cbfffc]/10">
                  <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#edfffe]">Contract Invoices</p>
                  <p className="text-3xl font-medium text-[#ffffff] mt-2">1,482 <span className="text-xs text-[#cbfffc]">Active</span></p>
                </div>
                <div className="p-5 bg-[#012624] rounded-[12px] border border-[#cbfffc]/10">
                  <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#edfffe]">Network Latency</p>
                  <p className="text-3xl font-medium text-[#fde9ff] mt-2">1.2s <span className="text-xs text-[#edfffe]">Instant</span></p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 2: #collection (Feature Cards in #003734 Surface 2) */}
      <section id="collection" className="relative z-10 py-32 px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-[12px] font-medium uppercase tracking-[0.15em] text-[#edfffe] mb-3">#COLLECTION</p>
          <h2 className="text-[36px] font-medium text-[#ffffff] tracking-[-0.03em]">Auros Feature Components</h2>
          <p className="text-[#bbc7c6] mt-4 text-base leading-[1.4]">High-performance smart contract tooling designed for enterprise precision.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature Card 1 */}
          <div className="bg-[#003734] rounded-[16px] p-9 border border-[#cbfffc]/10 shadow-none flex flex-col justify-between group hover:border-[#cbfffc]/30 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 rounded-[6px] bg-[#012624] text-[#cbfffc]">
                  <Zap size={24} />
                </div>
                <button className="h-[32px] w-[32px] rounded-[6px] bg-[rgba(3,81,75,0.5)] flex items-center justify-center text-white hover:bg-[#00827c] transition-colors">
                  <ArrowUpRight size={18} />
                </button>
              </div>
              <h3 className="text-[36px] font-medium text-[#ffffff] tracking-[-0.03em] leading-[1.15] mb-4">
                Instant Settlement
              </h3>
              <p className="text-base text-[#bbc7c6] leading-[1.4]">
                Direct peer-to-peer settlement via Stellar ledger transactions in under 5 seconds.
              </p>
            </div>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-[#003734] rounded-[16px] p-9 border border-[#cbfffc]/10 shadow-none flex flex-col justify-between group hover:border-[#cbfffc]/30 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 rounded-[6px] bg-[#012624] text-[#cbfffc]">
                  <ShieldCheck size={24} />
                </div>
                <button className="h-[32px] w-[32px] rounded-[6px] bg-[rgba(3,81,75,0.5)] flex items-center justify-center text-white hover:bg-[#00827c] transition-colors">
                  <ArrowUpRight size={18} />
                </button>
              </div>
              <h3 className="text-[36px] font-medium text-[#ffffff] tracking-[-0.03em] leading-[1.15] mb-4">
                Soroban Escrow
              </h3>
              <p className="text-base text-[#bbc7c6] leading-[1.4]">
                Smart contract escrow state checks ensure tamper-proof invoice lifecycle events.
              </p>
            </div>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-[#003734] rounded-[16px] p-9 border border-[#cbfffc]/10 shadow-none flex flex-col justify-between group hover:border-[#cbfffc]/30 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 rounded-[6px] bg-[#012624] text-[#cbfffc]">
                  <Lock size={24} />
                </div>
                <button className="h-[32px] w-[32px] rounded-[6px] bg-[rgba(3,81,75,0.5)] flex items-center justify-center text-white hover:bg-[#00827c] transition-colors">
                  <ArrowUpRight size={18} />
                </button>
              </div>
              <h3 className="text-[36px] font-medium text-[#ffffff] tracking-[-0.03em] leading-[1.15] mb-4">
                Non-Custodial
              </h3>
              <p className="text-base text-[#bbc7c6] leading-[1.4]">
                Your keys, your funds. Wallet connection handled securely via standard Freighter API.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: #craft (With Geometric Molecular Diagram) */}
      <section id="craft" className="relative z-10 py-32 px-8 max-w-7xl mx-auto border-t border-[#cbfffc]/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <p className="text-[12px] font-medium uppercase tracking-[0.15em] text-[#edfffe]">#CRAFT</p>
            <h2 className="text-[36px] font-medium text-[#ffffff] tracking-[-0.03em]">Precision Soroban Engine</h2>
            <p className="text-[#bbc7c6] text-base leading-[1.4]">
              Utilizes WASM-compiled Soroban contracts to create automated escrow hooks, verifiable receipt signatures, and automatic disbursement rules.
            </p>
            <div className="space-y-4 pt-4">
              <div className="flex items-center space-x-3 p-4 rounded-[6px] bg-[#003734] border border-[#cbfffc]/10">
                <Cpu size={20} className="text-[#cbfffc]" />
                <span className="text-sm font-medium text-[#edfffe]">Escrow State: Verified On-Chain</span>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-[6px] bg-[#003734] border border-[#cbfffc]/10">
                <Globe size={20} className="text-[#cbfffc]" />
                <span className="text-sm font-medium text-[#edfffe]">Protocol: SEP-0007 QR Payment Scheme</span>
              </div>
            </div>
          </div>

          {/* Right Column: Geometric Molecular Diagram Decorative Visual */}
          <div className="bg-[#003734] rounded-[16px] p-10 border border-[#cbfffc]/10 flex flex-col items-center justify-center min-h-[340px] relative overflow-hidden">
            <svg className="w-full h-64" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Connector lines */}
              <line x1="80" y1="120" x2="200" y2="60" stroke="#bbc7c6" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
              <line x1="80" y1="120" x2="200" y2="180" stroke="#bbc7c6" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
              <line x1="200" y1="60" x2="320" y2="120" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />
              <line x1="200" y1="180" x2="320" y2="120" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />
              <line x1="200" y1="60" x2="200" y2="180" stroke="#cbfffc" strokeWidth="2" opacity="0.7" />

              {/* Node circles */}
              <circle cx="80" cy="120" r="16" fill="#ffffff" />
              <circle cx="200" cy="60" r="22" fill="#ffffff" />
              <circle cx="200" cy="180" r="18" fill="#ffffff" />
              <circle cx="320" cy="120" r="26" fill="#ffffff" />

              {/* Inner accent dots */}
              <circle cx="80" cy="120" r="6" fill="#012624" />
              <circle cx="200" cy="60" r="8" fill="#00827c" />
              <circle cx="200" cy="180" r="6" fill="#012624" />
              <circle cx="320" cy="120" r="10" fill="#00827c" />
            </svg>
            <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#edfffe] mt-4">
              SOROBAN STATE MOLECULAR ARCHITECTURE
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: #integration */}
      <section id="integration" className="relative z-10 py-32 px-8 max-w-7xl mx-auto border-t border-[#cbfffc]/10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[12px] font-medium uppercase tracking-[0.15em] text-[#edfffe] mb-3">#INTEGRATION</p>
          <h2 className="text-[36px] font-medium text-[#ffffff] tracking-[-0.03em]">Seamless Wallet Authentication</h2>
          <p className="text-[#bbc7c6] mt-4 text-base">Compatible with all major Stellar wallet extensions and web signers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="p-7 rounded-[16px] bg-[#003734] border border-[#cbfffc]/10 shadow-none">
            <p className="font-medium text-[#ffffff] text-lg">Freighter</p>
            <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-[#cbfffc] mt-2">Native Extension</p>
          </div>
          <div className="p-7 rounded-[16px] bg-[#003734] border border-[#cbfffc]/10 shadow-none">
            <p className="font-medium text-[#ffffff] text-lg">xBull</p>
            <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-[#edfffe] mt-2">Mobile & Web</p>
          </div>
          <div className="p-7 rounded-[16px] bg-[#003734] border border-[#cbfffc]/10 shadow-none">
            <p className="font-medium text-[#ffffff] text-lg">Albedo</p>
            <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-[#cbfffc] mt-2">Web Auth</p>
          </div>
          <div className="p-7 rounded-[16px] bg-[#003734] border border-[#cbfffc]/10 shadow-none">
            <p className="font-medium text-[#ffffff] text-lg">SEP-0007</p>
            <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-[#fde9ff] mt-2">QR Standard</p>
          </div>
        </div>
      </section>

      {/* SECTION 5: #noema-manifesto */}
      <section id="noema-manifesto" className="relative z-10 py-32 px-8 max-w-5xl mx-auto text-center border-t border-[#cbfffc]/10">
        <p className="text-[12px] font-medium uppercase tracking-[0.15em] text-[#edfffe] mb-4">#NOEMA-MANIFESTO</p>
        <h2 className="text-[36px] md:text-[52px] font-medium text-[#ffffff] tracking-[-0.04em] leading-[1.1]">
          &ldquo;Global commerce without settlement delay, middleman fees, or opaque ledgers.&rdquo;
        </h2>
        <p className="mt-8 text-[#bbc7c6] max-w-xl mx-auto text-base leading-[1.4]">
          Stellar Invoice brings transparency and instant settlement to modern SaaS companies and global freelancers alike.
        </p>
      </section>

      {/* SECTION 6: #noema-board (With 86px+ Matter 500 Stat Counters in #fde9ff) */}
      <section id="noema-board" className="relative z-10 py-32 px-8 max-w-7xl mx-auto border-t border-[#cbfffc]/10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[12px] font-medium uppercase tracking-[0.15em] text-[#edfffe] mb-3">#NOEMA-BOARD</p>
          <h2 className="text-[36px] font-medium text-[#ffffff] tracking-[-0.03em]">Real-Time Ledger Performance</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#003734] rounded-[16px] p-9 text-center border border-[#cbfffc]/10 shadow-none">
            <div className="text-[86px] font-medium leading-[1.0] text-[#fde9ff] font-['Matter',sans-serif]">
              $2.4M
            </div>
            <div className="text-[13px] font-medium uppercase tracking-[0.1em] text-[#edfffe] mt-4">
              NETWORK VOLUME SETTLED
            </div>
          </div>

          <div className="bg-[#003734] rounded-[16px] p-9 text-center border border-[#cbfffc]/10 shadow-none">
            <div className="text-[86px] font-medium leading-[1.0] text-[#fde9ff] font-['Matter',sans-serif]">
              1.2s
            </div>
            <div className="text-[13px] font-medium uppercase tracking-[0.1em] text-[#edfffe] mt-4">
              AVERAGE FINALITY LATENCY
            </div>
          </div>

          <div className="bg-[#003734] rounded-[16px] p-9 text-center border border-[#cbfffc]/10 shadow-none">
            <div className="text-[86px] font-medium leading-[1.0] text-[#fde9ff] font-['Matter',sans-serif]">
              0.001
            </div>
            <div className="text-[13px] font-medium uppercase tracking-[0.1em] text-[#edfffe] mt-4">
              AVERAGE TRANSACTION COST ($)
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: #noema-support & CTA */}
      <section id="noema-support" className="relative z-10 py-32 px-8 max-w-5xl mx-auto text-center border-t border-[#cbfffc]/10">
        <p className="text-[12px] font-medium uppercase tracking-[0.15em] text-[#edfffe] mb-4">#NOEMA-SUPPORT</p>
        <h2 className="text-[36px] md:text-[54px] font-medium text-[#ffffff] tracking-[-0.04em] leading-[1.1]">
          Ready to Deploy Your First Soroban Invoice?
        </h2>
        <div className="mt-10 flex justify-center">
          <Link href="/invoices/create">
            <Button className="bg-[linear-gradient(90deg,#cbfffc_0%,#edfffe_26.25%,#fffdfa_47.57%,#fad1ff_88.96%)] text-[#011d1c] font-medium text-[14px] uppercase tracking-[0.05em] rounded-[6px] px-10 py-4 hover:opacity-90 shadow-none border-0">
              GET STARTED NOW <ArrowRight size={18} className="ml-2 inline" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Surface 1 Recessed Well Footer (120px Vertical Padding) */}
      <footer className="relative z-10 bg-[#011d1c] py-[120px] px-8 text-center text-xs text-[#bbc7c6] border-t border-[#cbfffc]/10">
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-[#edfffe]">
            AUROS ABYSSAL FINTECH TERMINAL — STELLAR LEVEL 4 MASTERY
          </p>
          <p className="text-xs font-light text-[#bbc7c6]/70">
            Powered by WASM-Compiled Soroban Smart Contracts on Stellar Testnet. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}

