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
    from external.bazi.datas import *
    from external.bazi.common import *
    from external.bazi.ganzhi import *
    # Import from our safe wrapper instead of directly from bazi.py
    from bazi.bazi_functions import (
        get_gen, gan_zhi_he, get_gong, is_ku, zhi_ku, gan_ke, jin_jiao,
        calculate_wuxing_scores, calculate_ten_deities, check_day_master_strength,
        get_nayin_for_ganzhi, get_empty_positions, analyze_special_stars, get_ten_deity, get_nayin, apply_shensha_rules, apply_shensha_other_rules, apply_xiao_er_guan_sha_rules
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
            day_pillar = self._get_pillar_details(gans.day, zhis.day, day_master, gans, zhis, True)
            hour_pillar = self._get_pillar_details(gans.time, zhis.time, day_master, gans, zhis)

            # Calculate shensha (神煞)
            shensha = self._get_shansha({"gan": gans._asdict(), "zhi": zhis._asdict()}, year)
            
            year_pillar["shensha"] = shensha["year"]
            month_pillar["shensha"] = shensha["month"]
            day_pillar["shensha"] = shensha["day"]
            hour_pillar["shensha"] = shensha["time"]
            print(shensha)

            # Calculate dayun (大運)
            yun = ba.getYun(gender == "male")
            dayun = self._get_dayun(yun, gans, zhis, day_master)

            
            # Calculate nayin (納音)
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
                "year_pillar": year_pillar,
                "month_pillar": month_pillar,
                "day_pillar": day_pillar,
                "hour_pillar": hour_pillar,
                "dayun": dayun,
                "lunar_date": lunar_date_str,
                "solar_date": solar_date_str,
                "nayin": nayin_info,
                "empty_positions": empty_positions,
                "analysis": analysis
            }
            
        except Exception as e:
            raise ValueError(f"Failed to calculate bazi: {str(e)}")
    
    def _get_pillar_details(self, gan: str, zhi: str, day_master: str, gans, zhis, is_day_master = False) -> Dict[str, Any]:
        """Get detailed information for a pillar using enhanced bazi logic"""
        try:
            # Get ten deities relationship (same as bazi.py)
            ten_deity = get_ten_deity(day_master, gan) if not is_day_master else "日主"
            zhi_ten_deity = get_ten_deity(day_master, zhi)
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
                        "ten_deity": get_ten_deity(day_master, hidden_gan)
                    })
            # Get Nayin
            nayin = get_nayin(gan, zhi)
            
            # Check for gan-zhi harmony using our function
            harmony = gan_zhi_he((gan, zhi))
            
            
            # Check if this is a treasury position using our function
            is_treasury = is_ku(zhi)
            return {
                "ganzhi": f"{gan}{zhi}",
                "gan": gan,
                "zhi": zhi,
                "gan_wuxing": gan_wuxing,
                "zhi_wuxing": gan5.get(list(zhi_wuxing.keys())[0], "unknown") if zhi_wuxing else "unknown",
                "ten_deity": ten_deity,
                "zhi_ten_deity": zhi_ten_deity,
                "hidden_stems": hidden_stems,
                "nayin": nayin,
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
                "zhi_ten_deity": "unknown",
                "hidden_stems": [],
                "nayin": "unknown",
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
                    "description": "身強" if is_strong else "身弱"
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
                    "advice": f"五行缺{weakest}，建議多接觸{weakest}相關的事物" if weakest != "unknown" else "五行較為平衡"
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
    def _get_dayun(self, yun, gans, zhis, day_master):
        """
        Get detailed dayun (大運) analysis based on bazi.py implementation
        
        Args:
            yun: Yun object from lunar-python
            gans: Four pillars heavenly stems
            zhis: Four pillars earthly branches  
            day_master: Day master (day gan)
            
        Returns:
            List of detailed dayun periods with comprehensive analysis
        """
        dayun_list = []
        
        try:
            # Get original chart pillars for reference
            zhus = [(gans[i], zhis[i]) for i in range(4)]
            day_zhu = (gans[2], zhis[2])  # Day pillar
            
            # Skip first item as it's the starting period, analyze from second onwards
            for idx, dayun_item in enumerate(yun.getDaYun()):
                if idx == 0:
                    if yun.getDaYun()[1].getStartAge() == 1:
                        continue
                    gan_ = yun.getDaYun()[1].getGanZhi()[0]
                    zhi_ = yun.getDaYun()[1].getGanZhi()[1]
                else:
                    gan_ = dayun_item.getGanZhi()[0]
                    zhi_ = dayun_item.getGanZhi()[1]
                start_age = dayun_item.getStartAge()
                
                # Check if this dayun gan-zhi appears in original chart
                is_repeated = (gan_, zhi_) in zhus
                
                
                
                # Get hidden stems (藏干) for dayun zhi
                hidden_stems = []
                if zhi_ in zhi5_list:
                    for hidden_gan in zhi5_list[zhi_]:
                        hidden_stems.append({
                            "gan": hidden_gan,
                            "ten_deity": get_ten_deity(day_master, hidden_gan),
                            "strength": zhi5[zhi_].get(hidden_gan, 0)
                        })
                
                # Calculate ten deities for dayun gan and zhi
                gan_ten_deity = get_ten_deity(day_master, gan_)
                zhi_ten_deity = hidden_stems[0]["ten_deity"]
                
                # Check relationships with original chart zhis
                zhi_relationships = set()
                for orig_zhi in zhis:
                    # Check all relationship types for this zhi
                    if zhi_ in zhi_atts and orig_zhi in zhi_atts[zhi_]:
                        for rel_type in zhi_atts[zhi_]:
                            if orig_zhi in zhi_atts[zhi_][rel_type] and rel_type != '破':  # Skip '破' as in original
                                zhi_relationships.add(f"{rel_type}:{orig_zhi}")
                
                # Check for empty positions (空亡)
                is_empty = zhi_ in empties.get(day_zhu, ())
                
                # Get nayin for this dayun
                nayin = get_nayin(gan_, zhi_)
                
                # Check for special combinations (夾、拱)
                special_combinations = []
                
                # Check for 夾 (sandwiching) relationships
                if gan_ in gans:
                    for i in range(4):
                        if gan_ == gans[i]:
                            orig_zhi = zhis[i] 
                            zhi_diff = abs(Zhi.index(zhi_) - Zhi.index(orig_zhi))
                            if zhi_diff == 2:
                                jia_zhi = Zhi[(Zhi.index(zhi_) + Zhi.index(orig_zhi)) // 2]
                                special_combinations.append(f"夾:{jia_zhi}")
                            elif zhi_diff == 10:
                                jia_zhi = Zhi[(Zhi.index(zhi_) + Zhi.index(orig_zhi)) % 12]
                                special_combinations.append(f"夾:{jia_zhi}")
                            
                            # Check for 拱 (arching) relationships
                            combined_key = orig_zhi + zhi_
                            if combined_key in gong_he and gong_he[combined_key] not in zhis:
                                special_combinations.append(f"拱:{gong_he[combined_key]}")
                
                # Get yin/yang nature
                gan_yinyang = "陽" if Gan.index(gan_) % 2 == 0 else "陰"
                zhi_yinyang = "陽" if Zhi.index(zhi_) % 2 == 0 else "陰"
                
                # Analyze flow years (流年) for this dayun period
                liunian_list = []
                zhis_extended = list(zhis) + [zhi_]  # Add dayun zhi to original zhis
                gans_extended = list(gans) + [gan_]  # Add dayun gan to original gans
                
                for liunian in dayun_item.getLiuNian():
                    gan2_ = liunian.getGanZhi()[0]
                    zhi2_ = liunian.getGanZhi()[1]
                    year = liunian.getYear()
                    age = liunian.getAge()
                    
                    # Check if this liunian gan-zhi appears in original chart
                    is_ln_repeated = (gan2_, zhi2_) in zhus
                    
                    # Calculate ten deities for liunian
                    ln_gan_ten_deity = get_ten_deity(day_master, gan2_)
                    ln_zhi_ten_deity = get_ten_deity(day_master, zhi2_)
                    
                    # Get hidden stems for liunian zhi
                    ln_hidden_stems = []
                    if zhi2_ in zhi5_list:
                        for hidden_gan in zhi5_list[zhi2_]:
                            ln_hidden_stems.append({
                                "gan": hidden_gan,
                                "ten_deity": get_ten_deity(day_master, hidden_gan)
                            })
                    
                    # Check relationships with extended zhis (original + dayun)
                    ln_zhi_relationships = set()
                    for ext_zhi in zhis_extended:
                        if zhi2_ in zhi_atts and ext_zhi in zhi_atts[zhi2_]:
                            for rel_type in zhi_atts[zhi2_]:
                                if rel_type != '破' and ext_zhi in zhi_atts[zhi2_][rel_type]:
                                    ln_zhi_relationships.add(f"{rel_type}:{ext_zhi}")
                    
                    # Check for empty positions
                    ln_is_empty = zhi2_ in empties.get(day_zhu, ())
                    
                    # Get nayin for liunian
                    ln_nayin = get_nayin(gan2_, zhi2_)
                    
                    # Check for special combinations in liunian
                    ln_special_combinations = []
                    if gan2_ in gans_extended:
                        for i in range(5):  # Now 5 elements including dayun
                            if gan2_ == gans_extended[i]:
                                base_zhi = zhis_extended[i]
                                zhi_diff = abs(Zhi.index(zhi2_) - Zhi.index(base_zhi))
                                if zhi_diff == 2:
                                    jia_zhi = Zhi[(Zhi.index(zhi2_) + Zhi.index(base_zhi)) // 2]
                                    ln_special_combinations.append(f"夾:{jia_zhi}")
                                elif zhi_diff == 10:
                                    jia_zhi = Zhi[(Zhi.index(zhi2_) + Zhi.index(base_zhi)) % 12]
                                    ln_special_combinations.append(f"夾:{jia_zhi}")
                                
                                # Check for arching
                                combined_key = base_zhi + zhi2_
                                if combined_key in gong_he and gong_he[combined_key] not in zhis:
                                    ln_special_combinations.append(f"拱:{gong_he[combined_key]}")
                    
                    # Check for special patterns (天羅地網, 四生, 四敗, 四庫)
                    all_zhis_set = set(zhis_extended) | {zhi2_}
                    ln_special_patterns = []
                    
                    if {'戌', '亥', '辰', '巳'}.issubset(all_zhis_set):
                        ln_special_patterns.append("天羅地網:戌亥辰巳")
                    if {'寅', '申', '巳', '亥'}.issubset(all_zhis_set) and len({'寅', '申', '巳', '亥'} & set(zhis)) == 2:
                        ln_special_patterns.append("四生:寅申巳亥")
                    if {'子', '午', '卯', '酉'}.issubset(all_zhis_set) and len({'子', '午', '卯', '酉'} & set(zhis)) == 2:
                        ln_special_patterns.append("四敗:子午卯酉")
                    if {'辰', '戌', '丑', '未'}.issubset(all_zhis_set) and len({'辰', '戌', '丑', '未'} & set(zhis)) == 2:
                        ln_special_patterns.append("四庫:辰戌丑未")
                    
                    liunian_list.append({
                        "year": year,
                        "age": age,
                        "ganzhi": f"{gan2_}{zhi2_}",
                        "gan": gan2_,
                        "zhi": zhi2_,
                        "gan_ten_deity": ln_gan_ten_deity,
                        "zhi_ten_deity": ln_hidden_stems[0]["ten_deity"],
                        "hidden_stems": ln_hidden_stems,
                        "zhi_relationships": list(ln_zhi_relationships),
                        "is_empty": ln_is_empty,
                        "is_repeated": is_ln_repeated,
                        "nayin": ln_nayin,
                        "special_combinations": ln_special_combinations,
                        "special_patterns": ln_special_patterns
                    })
                
                # Compile dayun period information
                dayun_period = {
                    "start_age": start_age,
                    "ganzhi": f"{gan_}{zhi_}",
                    "gan": gan_,
                    "zhi": zhi_,
                    "gan_ten_deity": gan_ten_deity,
                    "zhi_ten_deity": zhi_ten_deity,
                    "gan_yinyang": gan_yinyang,
                    "zhi_yinyang": zhi_yinyang,
                    "hidden_stems": hidden_stems,
                    "zhi_relationships": list(zhi_relationships),
                    "is_empty": is_empty,
                    "is_repeated": is_repeated,
                    "nayin": nayin,
                    "special_combinations": special_combinations,
                    "liunian": liunian_list
                }
                
                dayun_list.append(dayun_period)
            
            return dayun_list
            
        except Exception as e:
            # Fallback to simple version if detailed analysis fails
            simple_dayun = []
            for item in yun.getDaYun():
                simple_dayun.append({
                    "start_age": getattr(item, 'getStartAge', lambda: 0)(),
                    "ganzhi": item.getGanZhi(),
                    "error": f"Detailed analysis failed: {str(e)}"
                })
            return simple_dayun
    def _get_shansha(self, data, year):
        """
        Calculate 神煞 (special stars) for the bazi chart
        
        Args:
            data: Dictionary containing gan and zhi information
            year: Birth year to determine if person is a child
            
        Returns:
            Dictionary with shensha information for each pillar
        """
        # age of this person < 11 years old
        is_child = (datetime.datetime.now().year - year) < 11
        
        # Initialize result structure
        shensha = {
            "year": [],
            "month": [],
            "day": [],
            "time": []
        }

        # Apply different rules based on age
        try:
            shensha = apply_shensha_rules(shensha, data)
            shensha = apply_shensha_other_rules(shensha, data)
        except Exception as e:
            print(e)
            shensha = []
        
        if is_child:
            # Apply children-specific rules (小兒關煞)
            shensha = apply_xiao_er_guan_sha_rules(shensha, data)
            
        
        return {
            "year": list(dict.fromkeys(shensha["year"])),
            "month": list(dict.fromkeys(shensha["month"])), 
            "day": list(dict.fromkeys(shensha["day"])),
            "time": list(dict.fromkeys(shensha["time"]))
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
            result += f"身強弱: {analysis.get('day_master_strength', {}).get('description', 'unknown')}\n"
            result += f"五行分析: {analysis.get('wuxing_analysis', {}).get('wuxing_scores', {})}\n"
            result += f"根系分析: {analysis.get('root_analysis', 'unknown')}\n"
            result += f"十神分佈: {analysis.get('deity_distribution', {}).get('deity_counts', {})}\n"
            result += f"建議: {analysis.get('recommendations', {}).get('advice', '無建議')}\n"
            
            # Add special stars if any
            special_stars = analysis.get('special_stars', {})
            if special_stars:
                result += "特殊星煞: "
                for star_name, star_info in special_stars.items():
                    result += f"{star_name}({star_info.get('star', star_info.get('position', ''))}); "
                result += "\n"
            
            return result
            
        except Exception as e:
            return f"分析失敗: {str(e)}" 