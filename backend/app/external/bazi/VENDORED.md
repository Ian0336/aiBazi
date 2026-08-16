# Vendored: china-testing/bazi

八字排盤的資料表與干支運算，`app/bazi/bazi_functions.py` 直接依賴這四個模組。

| | |
|---|---|
| 來源 | https://github.com/china-testing/bazi |
| Commit | `2a5a70beb309fac8b24b17f1aff2b11914fe23b7` |
| 該 commit 日期 | 2025-05-09 |
| 取得方式 | 原為巢狀 git clone，2026-08-16 改為 vendor 進本 repo |

## 為什麼 vendor

原本這個目錄裡有自己的 `.git`，Git 不會追蹤巢狀 repo 的內容，導致整包從未進版控 —— 任何人 clone aiBazi 之後 `app.main` 會直接 `ModuleNotFoundError: No module named 'external'`，後端完全起不來。改為 vendor 後 clone 即可執行。

## 只保留四個檔案

依賴鏈（`common` 依賴 `sizi` 這條容易漏掉）：

```
app/bazi/bazi_functions.py
  ├── external.bazi.datas   ──> ganzhi
  ├── external.bazi.common  ──> datas, ganzhi, sizi
  └── external.bazi.ganzhi
```

上游其餘檔案（`bazi.py`、`yue.py`、`luohou.py`、`shengxiao.py`、`convert.py`、`books/`、`examples/`）都沒有被 import，已移除。其中兩個特別註記：

- `bazi.py` 是 argparse CLI，import 時就會解析參數，不能讓它被誤 import。
- `luohou.py` 依賴 `sxtwl`，那個套件不在 `requirements.txt` 裡，要用得先補依賴。

需要時可從上游該 commit 取回。
