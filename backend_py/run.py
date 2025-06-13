#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys

if __name__ == "__main__":
    # Set default environment variables
    os.environ.setdefault("PORT", "8000")
    os.environ.setdefault("HOST", "0.0.0.0")
    
    # Import and run the main application
    from main import app
    import uvicorn
    
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    print(f"🚀 Starting AI Bazi Backend (Python) on {host}:{port}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    ) 