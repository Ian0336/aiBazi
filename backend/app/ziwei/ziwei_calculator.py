#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Zi Wei Dou Shu (紫微斗數) chart calculation.

Thin adapter over `iztro-py`, which is a pure-Python port of the JavaScript
`iztro` library. This module owns everything the API layer should not have to
know about: the project's `male`/`female` + 0-23 hour convention vs iztro's
`男`/`女` + 0-12 時辰 index, and the gaps in iztro-py's own localisation.
"""

from typing import Any, Dict, List, Optional

from iztro_py import by_lunar, by_solar
from iztro_py.i18n import t
from iztro_py.utils.helpers import hour_to_time_index

# iztro-py only accepts 男/女; the rest of this project speaks male/female.
_GENDER = {"male": "男", "female": "女"}

# Year-boundary convention baked into iztro-py. It follows iztro's default
# `yearDivide='normal'`, i.e. the year stem/branch rolls over on 農曆正月初一,
# NOT on 立春 the way the /api/bazi endpoint does. For roughly 7 days a year
# (~2% of birthdays) the two endpoints therefore report a different 年柱 —
# for those charts the whole 四化 set differs too. That is a genuine difference
# of school, not a bug, so it is surfaced in the response instead of patched.
YEAR_DIVIDE = "normal"

# iztro-py leaks four simplified-Chinese strings into its zh-TW output:
# the 廟 brightness level, both 四化 names that differ between scripts
# (star/mutagen.py hardcodes ["禄", "权", "科", "忌"], bypassing i18n entirely),
# and the 流時 horoscope scope. Established by diffing the full zh-CN and zh-TW
# output vocabularies over 240 charts, so this list is complete rather than
# a guess — revisit it when bumping iztro-py.
_ZH_TW_FIXES = {"庙": "廟", "权": "權", "禄": "祿", "流时": "流時"}


class ZiweiCalculator:
    """Builds 紫微斗數 charts. Stateless and safe to share across requests."""

    def calculate(
        self,
        year: int,
        month: int,
        day: int,
        hour: int,
        is_lunar: bool = False,
        is_leap_month: bool = False,
        gender: str = "male",
        language: str = "zh-TW",
        fix_leap: bool = True,
        horoscope_date: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Build a full 紫微斗數 chart.

        Args:
            year, month, day: Birth date (solar unless `is_lunar`).
            hour: Birth hour 0-23. Mapped to iztro's 0-12 時辰 index, which
                distinguishes 早子時 (hour 0) from 晚子時 (hour 23).
            is_lunar: Treat the date as a lunar date.
            is_leap_month: Lunar leap month (only meaningful with `is_lunar`).
            gender: 'male' or 'female'.
            language: One of iztro's six locales; defaults to Traditional Chinese.
            fix_leap: Split a leap month at the 15th, per iztro's `fixLeap`.
            horoscope_date: Solar 'YYYY-MM-DD' to resolve 運限 for. Omit to skip.

        Returns:
            dict matching ZiweiResponse.

        Raises:
            ValueError: On an unknown gender or a date iztro-py rejects.
        """
        if gender not in _GENDER:
            raise ValueError(f"gender must be 'male' or 'female', got {gender!r}")

        time_index = hour_to_time_index(hour)
        date_str = f"{year}-{month:02d}-{day:02d}"
        iztro_gender = _GENDER[gender]

        if is_lunar:
            chart = by_lunar(
                date_str, time_index, iztro_gender, is_leap_month, fix_leap, language
            )
        else:
            chart = by_solar(date_str, time_index, iztro_gender, fix_leap, language)

        # Neither serialisation iztro-py offers is complete on its own:
        # to_iztro_dict() localises names but drops 大限/小限, while model_dump()
        # keeps them but emits raw keys like 'ziweiMaj'. Merge the two by palace
        # index — both are 12 entries in the same order.
        localized = chart.to_iztro_dict()
        raw = chart.model_dump()

        result: Dict[str, Any] = {
            "solar_date": localized["solarDate"],
            "lunar_date": localized["lunarDate"],
            "chinese_date": localized["chineseDate"],
            "year_divide": YEAR_DIVIDE,
            "time": localized["time"],
            "time_range": localized["timeRange"],
            "time_index": time_index,
            "gender": localized["gender"],
            "zodiac": localized["zodiac"],
            "sign": localized["sign"],
            "five_elements_class": localized["fiveElementsClass"],
            "soul": localized["soul"],
            "body": localized["body"],
            "soul_palace_branch": localized["earthlyBranchOfSoulPalace"],
            "body_palace_branch": localized["earthlyBranchOfBodyPalace"],
            "language": language,
            "palaces": [
                self._build_palace(loc, raw_palace, language)
                for loc, raw_palace in zip(localized["palaces"], raw["palaces"])
            ],
            "horoscope": None,
        }

        if horoscope_date:
            result["horoscope"] = self._build_horoscope(
                chart.horoscope(horoscope_date).model_dump(), language
            )

        return self._fix_locale(result, language)

    # ------------------------------------------------------------------
    # Chart assembly
    # ------------------------------------------------------------------

    def _build_palace(
        self, loc: Dict[str, Any], raw: Dict[str, Any], language: str
    ) -> Dict[str, Any]:
        """Merge a localised palace with the 大限/小限 fields only `raw` carries."""
        decadal = raw.get("decadal") or {}
        return {
            "index": raw["index"],
            "name": loc["name"],
            "is_body_palace": loc["isBodyPalace"],
            "is_original_palace": loc["isOriginalPalace"],
            "heavenly_stem": loc["heavenlyStem"],
            "earthly_branch": loc["earthlyBranch"],
            "major_stars": [self._build_star(s) for s in loc["majorStars"]],
            "minor_stars": [self._build_star(s) for s in loc["minorStars"]],
            "adjective_stars": [self._build_star(s) for s in loc["adjectiveStars"]],
            "changsheng12": loc["changsheng12"],
            "boshi12": loc["boshi12"],
            "jiangqian12": loc["jiangqian12"],
            "suiqian12": loc["suiqian12"],
            "decadal": {
                "range": list(decadal.get("range") or []),
                "heavenly_stem": self._stem(decadal.get("heavenly_stem"), language),
                "earthly_branch": self._branch(decadal.get("earthly_branch"), language),
            }
            if decadal
            else None,
            "ages": list(raw.get("ages") or []),
        }

    @staticmethod
    def _build_star(star: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "name": star["name"],
            "type": star.get("type"),
            "scope": star.get("scope"),
            "brightness": star.get("brightness") or None,
            "mutagen": star.get("mutagen") or None,
        }

    def _build_horoscope(self, h: Dict[str, Any], language: str) -> Dict[str, Any]:
        """Localise a horoscope result — iztro-py returns raw keys throughout."""
        return {
            "solar_date": h["solar_date"],
            "lunar_date": h["lunar_date"],
            "nominal_age": h.get("nominal_age"),
            "decadal": self._build_scope(h.get("decadal"), language),
            "yearly": self._build_scope(h.get("yearly"), language),
            "monthly": self._build_scope(h.get("monthly"), language),
            "daily": self._build_scope(h.get("daily"), language),
            "hourly": self._build_scope(h.get("hourly"), language),
            # iztro calls 小限 `age`; renamed here so the field name says what
            # it holds rather than looking like a number.
            "age_scope": self._build_scope(h.get("age"), language),
        }

    def _build_scope(
        self, scope: Optional[Dict[str, Any]], language: str
    ) -> Optional[Dict[str, Any]]:
        if not scope:
            return None
        return {
            "index": scope.get("index"),
            "name": scope.get("name"),
            "heavenly_stem": self._stem(scope.get("heavenly_stem"), language),
            "earthly_branch": self._branch(scope.get("earthly_branch"), language),
            "palace_names": [
                self._palace(n, language) for n in scope.get("palace_names") or []
            ],
            "mutagen": [self._star(s, language) for s in scope.get("mutagen") or []],
            "stars": scope.get("stars"),
        }

    # ------------------------------------------------------------------
    # Localisation helpers
    #
    # iztro-py's `t()` returns the key unchanged when it misses, so each helper
    # falls back to the raw key rather than raising — an untranslated star name
    # is better than a 500.
    # ------------------------------------------------------------------

    @staticmethod
    def _lookup(key: Optional[str], path: str, language: str) -> Optional[str]:
        if not key:
            return key
        full = f"{path}.{key}"
        value = t(full, language)
        return key if value == full else value

    def _stem(self, key: Optional[str], language: str) -> Optional[str]:
        return self._lookup(key, "heavenlyStem", language)

    def _branch(self, key: Optional[str], language: str) -> Optional[str]:
        return self._lookup(key, "earthlyBranch", language)

    def _palace(self, key: Optional[str], language: str) -> Optional[str]:
        return self._lookup(key, "palaces", language)

    def _star(self, key: Optional[str], language: str) -> Optional[str]:
        """Star names live under stars.major / stars.minor, or at the top level
        for 雜曜 — try each in turn."""
        if not key:
            return key
        for path in ("stars.major", "stars.minor"):
            value = self._lookup(key, path, language)
            if value != key:
                return value
        # 雜曜 sit at the locale's top level; t() returns the key on a miss.
        return t(key, language)

    def _fix_locale(self, node: Any, language: str) -> Any:
        """Repair iztro-py's simplified-Chinese leaks in zh-TW output."""
        if language != "zh-TW":
            return node
        if isinstance(node, dict):
            return {k: self._fix_locale(v, language) for k, v in node.items()}
        if isinstance(node, list):
            return [self._fix_locale(v, language) for v in node]
        if isinstance(node, str):
            return _ZH_TW_FIXES.get(node, node)
        return node
