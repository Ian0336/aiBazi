#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
API Dependencies.

This module provides shared dependencies for API routes,
including the Bazi calculator singleton instance.
"""

import os
import sys

# Add the external bazi directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'external', 'bazi'))

from bazi.bazi_calculator import BaziCalculator

# Singleton instance of the Bazi calculator
_calculator_instance: BaziCalculator = None


def get_calculator() -> BaziCalculator:
    """
    Get the singleton Bazi calculator instance.
    
    Returns:
        BaziCalculator: The shared calculator instance.
    """
    global _calculator_instance
    if _calculator_instance is None:
        _calculator_instance = BaziCalculator()
    return _calculator_instance
