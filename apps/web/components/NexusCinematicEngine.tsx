"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useWallet } from "../hooks/useWallet";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Hexagon, ArrowRight, ShieldCheck, Zap, Lock, Globe, Cpu, Layers, Sparkles } from "lucide-react";

export default function NexusCinematicEngine() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { isConnected, connect, address } = useWallet();

  useEffect(() => {
    // Register GSAP plugins safely on client
    gsap.registerPlugin(ScrollTrigger);

    // -------------------------------------------------------------
    // THREE.JS CANVAS & PARTICLE ENGINE (Additive blending & bloom)
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

    // Particle Geometry Construction
    const particleCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorPrimary = new THREE.Color("#f5b8d0");
    const colorCore = new THREE.Color("#ffd9e8");

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

      const isCore = Math.random() > 0.6;
      const c = isCore ? colorCore : colorPrimary;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Custom Additive Particle Material
    const material = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      particles.rotation.y = elapsedTime * 0.04;
      particles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.05;
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
    // GSAP 3.12.5 SCROLLTRIGGER TIMELINE (12.75s Virtual Scroll Engine)
    // -------------------------------------------------------------
    const container = containerRef.current;
    if (container) {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: "#cinematic",
          start: "top top",
          end: "bottom bottom",
          scrub: 1, // Smooth scrub 12.75s timeline
          pin: ".sticky-hero-frame",
        },
      });

      // Animate Letterboxing height from 0.000314vh to 7vh
      timeline.to("#lbTop, #lbBot", {
        height: "7vh",
        ease: "power2.inOut",
        duration: 0.2,
      }, 0);

      // Camera Z Zoom on Particle Mesh
      timeline.to(camera.position, {
        z: 2.2,
        ease: "none",
        duration: 1.0,
      }, 0);

      // Reveal Story Blocks
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

    // -------------------------------------------------------------
    // 3D TILT EFFECT ON POINTER MOVE (perspective(1000px))
    // -------------------------------------------------------------
    const handlePointerMove = (e: MouseEvent) => {
      const tiltCards = document.querySelectorAll<HTMLElement>(".tilt-card");
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const rotateX = ((clientY - centerY) / centerY) * -8;
      const rotateY = ((clientX - centerX) / centerX) * 8;

      tiltCards.forEach((card) => {
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
    };

    window.addEventListener("pointermove", handlePointerMove);

    // Teardown Cleanup Logic (Prevent React Memory Leaks)
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="relative bg-[#0a0a0c] text-[#f4f2ef] overflow-hidden selection:bg-[#08B5E5] selection:text-white">
      
      {/* Three.js Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 w-full h-full"
      />

      {/* Screen Blend Grade Wash Layer */}
      <div
        id="gradeWash"
        className="fixed inset-0 pointer-events-none z-0 mix-blend-screen opacity-40 bg-[radial-gradient(ellipse_at_center,rgba(8,181,229,0.15)_0%,rgba(10,10,12,0)_70%)]"
      />

      {/* Letterboxing Bars */}
      <div
        id="lbTop"
        className="fixed top-0 left-0 right-0 bg-[#0a0a0c] z-40 transition-all duration-300 pointer-events-none border-b border-white/5"
        style={{ height: "0.000314vh" }}
      />
      <div
        id="lbBot"
        className="fixed bottom-0 left-0 right-0 bg-[#0a0a0c] z-40 transition-all duration-300 pointer-events-none border-t border-white/5"
        style={{ height: "0.000314vh" }}
      />

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between backdrop-blur-md border-b border-white/5 bg-[#0a0a0c]/60">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#08B5E5] to-[#14D9C4] p-0.5 flex items-center justify-center shadow-[0_0_25px_rgba(8,181,229,0.4)]">
            <div className="h-full w-full bg-[#0a0a0c] rounded-[10px] flex items-center justify-center">
              <Hexagon className="h-5 w-5 text-[#08B5E5] animate-spin-slow" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-mono">Stellar Invoice</span>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-xs font-mono tracking-widest text-[#f4f2ef]/70">
          <a href="#collection" className="hover:text-white transition-colors">COLLECTION</a>
          <a href="#craft" className="hover:text-white transition-colors">CRAFT</a>
          <a href="#integration" className="hover:text-white transition-colors">SOROBAN</a>
          <a href="#noema-manifesto" className="hover:text-white transition-colors">MANIFESTO</a>
          <a href="#noema-board" className="hover:text-white transition-colors">ANALYTICS</a>
        </div>

        <div className="flex items-center space-x-4">
          {!isConnected ? (
            <Button onClick={connect} size="sm" className="shadow-[var(--shadow-premium-button)] text-xs font-mono">
              CONNECT FREIGHTER
            </Button>
          ) : (
            <Link href="/dashboard">
              <Button size="sm" className="shadow-[var(--shadow-premium-button)] text-xs font-mono">
                ENTER DASHBOARD <ArrowRight size={14} className="ml-1.5" />
              </Button>
            </Link>
          )}
        </div>
      </nav>

      {/* SECTION 1: #cinematic (Sticky 820vh Scroll Container) */}
      <div id="cinematic" ref={containerRef} className="relative h-[820vh] z-10">
        <div className="sticky-hero-frame sticky top-0 h-screen w-full flex flex-col items-center justify-center px-6 overflow-hidden">
          
          {/* Main Editorial Hero Story Title */}
          <div id="heroStoryText" className="text-center max-w-4xl opacity-100 transform translate-y-0 transition-all duration-500 z-20">
            <Badge variant="premium" className="mb-6 font-mono text-xs uppercase tracking-widest px-4 py-1.5 border border-[#08B5E5]/30 bg-[#08B5E5]/10">
              <Sparkles size={14} className="mr-2 text-[#08B5E5]" /> NEXUS CINEMATIC WEB3 ENGINE
            </Badge>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[1.05] uppercase">
              Next-Gen <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#08B5E5] via-[#14D9C4] to-[#7C5CFC]">Stellar Invoicing</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-[#f4f2ef]/70 font-light max-w-2xl mx-auto leading-relaxed">
              Automated, non-custodial Soroban smart contract billing. Settle invoices globally in seconds with cryptographic proof.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/invoices/create">
                <Button size="lg" className="w-full sm:w-auto text-sm tracking-wider uppercase font-bold shadow-[0_0_30px_rgba(8,181,229,0.3)]">
                  Create Invoice Request
                </Button>
              </Link>
              <a href="#collection">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto text-sm tracking-wider uppercase font-bold">
                  Explore Architecture
                </Button>
              </a>
            </div>
          </div>

          {/* Interactive Dashboard Preview Frame (Revealed on Scrub) */}
          <div
            id="heroDashboardPreview"
            className="absolute inset-x-6 bottom-16 max-w-5xl mx-auto opacity-0 scale-95 transition-all duration-700 pointer-events-auto z-30"
          >
            <Card variant="glass" padding="lg" className="tilt-card border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] backdrop-blur-2xl bg-[#06121F]/80">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-danger/80" />
                  <div className="h-3 w-3 rounded-full bg-warning/80" />
                  <div className="h-3 w-3 rounded-full bg-success/80" />
                  <span className="text-xs font-mono text-[#f4f2ef]/50 ml-2">soroban-contract-v1.0.wasm</span>
                </div>
                <Badge variant="success">LIVE TESTNET</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-mono uppercase text-[#f4f2ef]/50">Settled Balance</p>
                  <p className="text-2xl font-black text-white mt-1">124,500.00 <span className="text-xs text-[#08B5E5]">XLM</span></p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-mono uppercase text-[#f4f2ef]/50">Contract Invoices</p>
                  <p className="text-2xl font-black text-white mt-1">1,482 <span className="text-xs text-emerald font-semibold">Active</span></p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-mono uppercase text-[#f4f2ef]/50">Network Latency</p>
                  <p className="text-2xl font-black text-white mt-1">1.2s <span className="text-xs text-success">Instant</span></p>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </div>

      {/* SECTION 2: #collection (Bento Grid Features) */}
      <section id="collection" className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#08B5E5] mb-3">#COLLECTION</h2>
          <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">Fintech Architecture Redefined</h3>
          <p className="text-[#f4f2ef]/70 mt-4 font-light text-base">Built natively for high-throughput enterprise billing on Stellar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="glass" padding="lg" className="tilt-card space-y-4 border border-white/10 hover:border-[#08B5E5]/40 transition-all">
            <div className="bg-[#08B5E5]/10 p-3 rounded-2xl w-fit text-[#08B5E5] border border-[#08B5E5]/20">
              <Zap size={24} />
            </div>
            <h4 className="text-xl font-bold text-white">Instant Settlement</h4>
            <p className="text-xs text-[#f4f2ef]/70 font-light leading-relaxed">
              Direct peer-to-peer settlement via Stellar ledger transactions in under 5 seconds.
            </p>
          </Card>

          <Card variant="glass" padding="lg" className="tilt-card space-y-4 border border-white/10 hover:border-[#14D9C4]/40 transition-all">
            <div className="bg-[#14D9C4]/10 p-3 rounded-2xl w-fit text-[#14D9C4] border border-[#14D9C4]/20">
              <ShieldCheck size={24} />
            </div>
            <h4 className="text-xl font-bold text-white">Soroban Verification</h4>
            <p className="text-xs text-[#f4f2ef]/70 font-light leading-relaxed">
              Smart contract escrow state checks ensure tamper-proof invoice lifecycle events.
            </p>
          </Card>

          <Card variant="glass" padding="lg" className="tilt-card space-y-4 border border-white/10 hover:border-[#7C5CFC]/40 transition-all">
            <div className="bg-[#7C5CFC]/10 p-3 rounded-2xl w-fit text-[#7C5CFC] border border-[#7C5CFC]/20">
              <Lock size={24} />
            </div>
            <h4 className="text-xl font-bold text-white">Non-Custodial Security</h4>
            <p className="text-xs text-[#f4f2ef]/70 font-light leading-relaxed">
              Your keys, your funds. Wallet connection handled securely via standard Freighter API.
            </p>
          </Card>
        </div>
      </section>

      {/* SECTION 3: #craft (Engineering Highlights) */}
      <section id="craft" className="relative z-10 py-32 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#14D9C4]">#CRAFT</h2>
            <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">Precision Smart Contract Protocol</h3>
            <p className="text-[#f4f2ef]/70 font-light text-sm leading-relaxed">
              Stellar Invoice utilizes WASM-compiled Soroban contracts to create automated escrow hooks, verifiable receipt signatures, and automatic disbursement rules.
            </p>
            <div className="space-y-3 font-mono text-xs text-[#f4f2ef]/80">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <Cpu size={16} className="text-[#08B5E5]" />
                <span>Escrow State: Verified On-Chain</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <Globe size={16} className="text-[#14D9C4]" />
                <span>Protocol: SEP-0007 QR Payment Scheme</span>
              </div>
            </div>
          </div>

          <Card variant="glass" padding="lg" className="tilt-card border border-white/10 bg-[#06121F]/90 font-mono text-xs text-white/90 overflow-x-auto">
            <div className="text-text-muted mb-2 text-[10px] uppercase">// Soroban Invoice Contract Interface</div>
            <pre className="text-emerald font-mono leading-relaxed">
{`pub fn create_invoice(
    env: Env,
    client: Address,
    amount: i128,
    memo: String
) -> u64 {
    client.require_auth();
    let invoice_id = increment_id(&env);
    env.storage().persistent().set(
        &DataKey::Invoice(invoice_id),
        &InvoiceState::Pending
    );
    invoice_id
}`}
            </pre>
          </Card>
        </div>
      </section>

      {/* SECTION 4: #integration (Soroban Integration) */}
      <section id="integration" className="relative z-10 py-32 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#7C5CFC] mb-3">#INTEGRATION</h2>
          <h3 className="text-4xl font-black text-white uppercase tracking-tight">Seamless Wallet Authentication</h3>
          <p className="text-[#f4f2ef]/70 mt-4 font-light text-sm">Compatible with all major Stellar wallet extensions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all">
            <p className="font-bold text-white text-base">Freighter</p>
            <p className="text-[10px] font-mono text-[#08B5E5] mt-1">Native Support</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all">
            <p className="font-bold text-white text-base">Albedo</p>
            <p className="text-[10px] font-mono text-[#14D9C4] mt-1">Web Auth</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all">
            <p className="font-bold text-white text-base">Rango</p>
            <p className="text-[10px] font-mono text-[#7C5CFC] mt-1">Multi-Chain</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all">
            <p className="font-bold text-white text-base">SEP-0007</p>
            <p className="text-[10px] font-mono text-success mt-1">QR Standard</p>
          </div>
        </div>
      </section>

      {/* SECTION 5: #noema-manifesto */}
      <section id="noema-manifesto" className="relative z-10 py-32 px-6 max-w-5xl mx-auto text-center border-t border-white/5">
        <h2 className="text-xs font-mono uppercase tracking-widest text-[#08B5E5] mb-3">#NOEMA-MANIFESTO</h2>
        <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
          &ldquo;Global commerce without settlement delay, middleman fees, or opaque ledgers.&rdquo;
        </h3>
        <p className="mt-8 text-[#f4f2ef]/60 font-light max-w-xl mx-auto text-sm">
          Stellar Invoice brings transparency and instant settlement to modern SaaS companies and global freelancers alike.
        </p>
      </section>

      {/* SECTION 6: #noema-board */}
      <section id="noema-board" className="relative z-10 py-32 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#14D9C4] mb-3">#NOEMA-BOARD</h2>
          <h3 className="text-4xl font-black text-white uppercase tracking-tight">Real-Time Ledger Metrics</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="glass" padding="lg" className="text-center space-y-2 border border-white/10">
            <p className="text-xs font-mono text-[#f4f2ef]/50 uppercase">Network Volume</p>
            <p className="text-4xl font-black text-white">$2.4M+</p>
          </Card>
          <Card variant="glass" padding="lg" className="text-center space-y-2 border border-white/10">
            <p className="text-xs font-mono text-[#f4f2ef]/50 uppercase">Average Finality</p>
            <p className="text-4xl font-black text-[#14D9C4]">1.2s</p>
          </Card>
          <Card variant="glass" padding="lg" className="text-center space-y-2 border border-white/10">
            <p className="text-xs font-mono text-[#f4f2ef]/50 uppercase">Transaction Fee</p>
            <p className="text-4xl font-black text-[#08B5E5]">&lt; $0.0001</p>
          </Card>
        </div>
      </section>

      {/* SECTION 7: #noema-support & CTA */}
      <section id="noema-support" className="relative z-10 py-32 px-6 max-w-5xl mx-auto text-center border-t border-white/5">
        <Badge variant="premium" className="mb-6 font-mono text-xs uppercase tracking-widest">
          LAUNCH YOUR FIRST INVOICE
        </Badge>
        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight">
          Ready to Upgrade Your Invoicing?
        </h2>
        <div className="mt-10 flex justify-center">
          <Link href="/invoices/create">
            <Button size="lg" className="shadow-[0_0_40px_rgba(8,181,229,0.4)] text-sm tracking-wider uppercase font-bold px-10 py-4">
              Get Started Now <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-8 text-center text-xs text-[#f4f2ef]/40 font-mono">
        <p>© 2026 Stellar Invoice. Powered by Soroban Smart Contracts & Stellar Network.</p>
      </footer>

    </div>
  );
}
