#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime
import collections

# Add the external bazi directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'external', 'bazi'))

from lunar_python import Lunar, Solar

# Import from the bazi library and our safe wrapper
try:
    from datas import *
    from common import *
    from ganzhi import *
    # Import from our safe wrapper instead of directly from bazi.py
    from bazi_functions import (
        get_gen, gan_zhi_he, get_gong, is_ku, zhi_ku, gan_ke, jin_jiao,
        calculate_wuxing_scores, calculate_ten_deities, check_day_master_strength,
        get_nayin_for_ganzhi, get_empty_positions, analyze_special_stars
    )
except ImportError as e:
    print(f"Error importing bazi modules: {e}")
    print("Make sure the bazi library is properly installed in external/bazi/")
    raise

class BaziCalculator:
    """
    Wrapper class for the bazi calculation library using safe functions from bazi_functions.py
    """
    
    def __init__(self):
        """Initialize the calculator"""
        # Define namedtuples for consistency (same as bazi.py)
        self.Gans = collections.namedtuple("Gans", "year month day time")
        self.Zhis = collections.namedtuple("Zhis", "year month day time")
    
    def calculate_bazi(
        self,
        year: int,
        month: int,
        day: int,
        hour: int,
        is_lunar: bool = False,
        is_leap_month: bool = False,
        gender: str = "male"
    ) -> Dict[str, Any]:
        """
        Calculate Bazi for given date and time using enhanced bazi functions
        
        Args:
            year: Year (1900-2100)
            month: Month (1-12)
            day: Day (1-31)
            hour: Hour (0-23)
            is_lunar: Whether the input date is lunar calendar
            is_leap_month: Whether it's a leap month (only for lunar)
            gender: "male" or "female"
            
        Returns:
            Dictionary containing complete bazi calculation results
        """
        try:
            # Convert between solar and lunar calendar (same logic as bazi.py)
            if is_lunar:
                # Input is lunar, convert to solar
                month_adj = month * -1 if is_leap_month else month
                lunar = Lunar.fromYmdHms(year, month_adj, day, hour, 0, 0)
                solar = lunar.getSolar()
                lunar_date_str = f"{year}年{abs(month_adj)}月{day}日"
                solar_date_str = f"{solar.getYear()}年{solar.getMonth()}月{solar.getDay()}日"
            else:
                # Input is solar, convert to lunar (same as bazi.py)
                solar = Solar.fromYmdHms(year, month, day, hour, 0, 0)
                lunar = solar.getLunar()
                solar_date_str = f"{year}年{month}月{day}日"
                lunar_date_str = f"{lunar.getYear()}年{lunar.getMonth()}月{lunar.getDay()}日"
            
            # Get eight characters (bazi) - same as bazi.py
            ba = lunar.getEightChar()
            
            # Extract gan and zhi using same structure as bazi.py
            gans = self.Gans(
                year=ba.getYearGan(),
                month=ba.getMonthGan(),
                day=ba.getDayGan(),
                time=ba.getTimeGan()
            )
            
            zhis = self.Zhis(
                year=ba.getYearZhi(),
                month=ba.getMonthZhi(),
                day=ba.getDayZhi(),
                time=ba.getTimeZhi()
            )
            
            # Day master (日主) - same as bazi.py
            day_master = gans.day
            
            # Calculate detailed information for each pillar using enhanced methods
            year_pillar = self._get_pillar_details(gans.year, zhis.year, day_master, gans, zhis)
            month_pillar = self._get_pillar_details(gans.month, zhis.month, day_master, gans, zhis)
            day_pillar = self._get_pillar_details(gans.day, zhis.day, day_master, gans, zhis)
            hour_pillar = self._get_pillar_details(gans.time, zhis.time, day_master, gans, zhis)
            
            # Calculate nayin (纳音)
            nayin_info = {
                "year": get_nayin_for_ganzhi(gans.year, zhis.year),
                "month": get_nayin_for_ganzhi(gans.month, zhis.month),
                "day": get_nayin_for_ganzhi(gans.day, zhis.day),
                "hour": get_nayin_for_ganzhi(gans.time, zhis.time)
            }
            
            # Calculate empty positions (空亡)
            empty_positions = get_empty_positions(gans.day, zhis.day, list(zhis))
            
            # Generate comprehensive analysis using bazi functions
            analysis = self._generate_comprehensive_analysis(gans, zhis, day_master, gender)
            
            return {
                "year_ganzhi": f"{gans.year}{zhis.year}",
                "month_ganzhi": f"{gans.month}{zhis.month}",
                "day_ganzhi": f"{gans.day}{zhis.day}",
                "hour_ganzhi": f"{gans.time}{zhis.time}",
                "year_pillar": year_pillar,
                "month_pillar": month_pillar,
                "day_pillar": day_pillar,
                "hour_pillar": hour_pillar,
                "lunar_date": lunar_date_str,
                "solar_date": solar_date_str,
                "nayin": nayin_info,
                "empty_positions": empty_positions,
                "analysis": analysis
            }
            
        except Exception as e:
            raise ValueError(f"Failed to calculate bazi: {str(e)}")
    
    def _get_pillar_details(self, gan: str, zhi: str, day_master: str, gans, zhis) -> Dict[str, Any]:
        """Get detailed information for a pillar using enhanced bazi logic"""
        try:
            # Get ten deities relationship (same as bazi.py)
            ten_deity = ten_deities[day_master].get(gan, "unknown") if gan != day_master else "日主"
            
            # Get five elements
            gan_wuxing = gan5.get(gan, "unknown")
            zhi_wuxing = zhi5.get(zhi, {})
            
            # Get zhi hidden stems (藏干) with enhanced information
            hidden_stems = []
            if zhi in zhi5_list:
                for hidden_gan in zhi5_list[zhi]:
                    hidden_stems.append({
                        "gan": hidden_gan,
                        "wuxing": gan5.get(hidden_gan, "unknown"),
                        "ten_deity": ten_deities[day_master].get(hidden_gan, "unknown")
                    })
            
            # Check for gan-zhi harmony using our function
            harmony = gan_zhi_he((gan, zhi))
            
            # Check if this is a treasury position using our function
            is_treasury = is_ku(zhi)
            
            return {
                "ganzhi": f"{gan}{zhi}",
                "gan": gan,
                "zhi": zhi,
                "gan_wuxing": gan_wuxing,
                "zhi_wuxing": list(zhi_wuxing.keys())[0] if zhi_wuxing else "unknown",
                "ten_deity": ten_deity,
                "hidden_stems": hidden_stems,
                "harmony": harmony,
                "is_treasury": is_treasury
            }
        except Exception:
            # Fallback for missing data
            return {
                "ganzhi": f"{gan}{zhi}",
                "gan": gan,
                "zhi": zhi,
                "gan_wuxing": "unknown",
                "zhi_wuxing": "unknown",
                "ten_deity": "unknown",
                "hidden_stems": [],
                "harmony": "",
                "is_treasury": False
            }
    
    def _generate_comprehensive_analysis(self, gans, zhis, day_master: str, gender: str) -> Dict[str, Any]:
        """Generate comprehensive analysis using enhanced bazi functions"""
        try:
            # Calculate five element scores using our enhanced function
            wuxing_scores, gan_scores = calculate_wuxing_scores(gans, zhis)
            
            # Find strongest and weakest elements
            strongest = max(wuxing_scores, key=wuxing_scores.get)
            weakest = min(wuxing_scores, key=wuxing_scores.get)
            
            # Get root analysis using our function
            root_analysis = get_gen(day_master, zhis)
            
            # Calculate ten deities distribution using our function
            gan_shens, zhi_shens = calculate_ten_deities(gans, zhis, day_master)
            
            # Calculate deity distribution
            all_shens = gan_shens + zhi_shens
            deity_counts = {}
            for shen in all_shens:
                if shen != '日主':
                    deity_counts[shen] = deity_counts.get(shen, 0) + 1
            
            # Check day master strength using our function
            is_strong = check_day_master_strength(gans, zhis, day_master)
            
            # Get special combinations
            try:
                gong_combinations = get_gong(zhis)
            except:
                gong_combinations = []
            
            # Check for special patterns
            gan_list = list(gans)
            zhi_list = list(zhis)
            
            # Count repeated elements
            gan_counts = {gan: gan_list.count(gan) for gan in set(gan_list)}
            zhi_counts = {zhi: zhi_list.count(zhi) for zhi in set(zhi_list)}
            
            # Find patterns
            repeated_gans = {gan: count for gan, count in gan_counts.items() if count > 1}
            repeated_zhis = {zhi: count for zhi, count in zhi_counts.items() if count > 1}
            
            # Analyze special stars
            special_stars = analyze_special_stars(gans, zhis, day_master)
            
            # Check for yang/yin nature of day master
            is_yang_day = (Gan.index(day_master) % 2 == 0)
            
            return {
                "wuxing_analysis": {
                    "wuxing_scores": wuxing_scores,
                    "gan_scores": gan_scores,
                    "strongest_element": strongest,
                    "weakest_element": weakest,
                    "total_score": sum(wuxing_scores.values())
                },
                "root_analysis": root_analysis,
                "day_master_strength": {
                    "is_strong": is_strong,
                    "description": "身强" if is_strong else "身弱"
                },
                "combinations": {
                    "gong_combinations": gong_combinations,
                    "repeated_gans": repeated_gans,
                    "repeated_zhis": repeated_zhis
                },
                "deity_distribution": {
                    "gan_deities": gan_shens,
                    "zhi_deities": zhi_shens,
                    "deity_counts": deity_counts
                },
                "day_master_nature": {
                    "gan": day_master,
                    "is_yang": is_yang_day,
                    "element": gan5.get(day_master, "unknown")
                },
                "special_stars": special_stars,
                "gender": gender,
                "recommendations": {
                    "lacking_element": weakest,
                    "strong_element": strongest,
                    "advice": f"五行缺{weakest}，建议多接触{weakest}相关的事物" if weakest != "unknown" else "五行较为平衡"
                }
            }
        except Exception as e:
            # Fallback basic analysis
            return {
                "wuxing_analysis": {"error": str(e)},
                "root_analysis": "unknown",
                "day_master_strength": {"is_strong": False, "description": "unknown"},
                "combinations": {},
                "deity_distribution": {},
                "day_master_nature": {"gan": day_master},
                "special_stars": {},
                "gender": gender,
                "recommendations": {}
            }
    
    def analyze_bazi(
        self,
        year_ganzhi: str,
        month_ganzhi: str,
        day_ganzhi: str,
        hour_ganzhi: str
    ) -> str:
        """
        Analyze bazi chart and return detailed analysis
        
        Args:
            year_ganzhi: Year pillar (e.g., "甲子")
            month_ganzhi: Month pillar  
            day_ganzhi: Day pillar
            hour_ganzhi: Hour pillar
            
        Returns:
            Detailed analysis string
        """
        try:
            # Extract individual characters
            year_gan, year_zhi = year_ganzhi[0], year_ganzhi[1]
            month_gan, month_zhi = month_ganzhi[0], month_ganzhi[1]
            day_gan, day_zhi = day_ganzhi[0], day_ganzhi[1]
            hour_gan, hour_zhi = hour_ganzhi[0], hour_ganzhi[1]
            
            # Create the tuples for analysis
            gans = self.Gans(year=year_gan, month=month_gan, day=day_gan, time=hour_gan)
            zhis = self.Zhis(year=year_zhi, month=month_zhi, day=day_zhi, time=hour_zhi)
            
            day_master = day_gan
            
            # Get comprehensive analysis
            analysis = self._generate_comprehensive_analysis(gans, zhis, day_master, "male")
            
            # Format the analysis into a readable string
            result = f"八字分析: {year_ganzhi} {month_ganzhi} {day_ganzhi} {hour_ganzhi}\n"
            result += f"日主: {day_master} ({analysis.get('day_master_nature', {}).get('element', 'unknown')})\n"
            result += f"身强弱: {analysis.get('day_master_strength', {}).get('description', 'unknown')}\n"
            result += f"五行分析: {analysis.get('wuxing_analysis', {}).get('wuxing_scores', {})}\n"
            result += f"根系分析: {analysis.get('root_analysis', 'unknown')}\n"
            result += f"十神分布: {analysis.get('deity_distribution', {}).get('deity_counts', {})}\n"
            result += f"建议: {analysis.get('recommendations', {}).get('advice', '无建议')}\n"
            
            # Add special stars if any
            special_stars = analysis.get('special_stars', {})
            if special_stars:
                result += "特殊星煞: "
                for star_name, star_info in special_stars.items():
                    result += f"{star_name}({star_info.get('star', star_info.get('position', ''))}); "
                result += "\n"
            
            return result
            
        except Exception as e:
            return f"分析失败: {str(e)}" 