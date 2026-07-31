#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
迁移剩余的"常用"站点图标到本地存储
下载：微信文件、和风天气、百度翻译、抖音
"""

import os
import sys
import requests
import hashlib
import time
from pathlib import Path
from urllib.parse import urlparse
import urllib3

# 禁用 SSL 警告
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# 配置 Windows 控制台编码
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except:
        pass

# 配置
# 脚本在 database/ 目录下，需要回到项目根目录
SCRIPT_DIR = Path(__file__).parent.absolute()
# 从 database/ 回到项目根目录（softeng-platform/）
PROJECT_ROOT = SCRIPT_DIR.parent
# 再进入 softeng-platform/ 目录
UPLOAD_DIR = PROJECT_ROOT / 'softeng-platform' / 'uploads' / 'images' / 'common'
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
TIMEOUT = 30
MAX_RETRIES = 3
RETRY_DELAY = 2

# 需要下载的图标
ICONS_TO_DOWNLOAD = [
    {
        'name': '微信文件',
        'url': 'https://file.fengfengzhidao.com/logo/wechat.png',
        'local_name': '微信文件.png'
    },
    {
        'name': '和风天气',
        'url': 'https://cdn.heweather.com/img/logo.png',
        'local_name': '和风天气.png'
    },
    {
        'name': '百度翻译',
        'url': 'https://fanyi.bdstatic.com/static/translation/img/favicon.ico',
        'local_name': '百度翻译.ico'
    },
    {
        'name': '抖音',
        'url': 'https://lf1-cdn2-tos.bytego.com/obj/ies-fe-bee-prod/cn/fe/bee_prod_cn_bee_home_page_logo.png',
        'local_name': '抖音.png'
    }
]

def ensure_upload_dir():
    """确保上传目录存在"""
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    print(f'✓ 上传目录已准备: {UPLOAD_DIR}')

def download_image(url, local_path, name):
    """下载图片"""
    print(f'\n正在下载 {name}...')
    print(f'  URL: {url}')
    print(f'  保存到: {local_path}')
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(url, headers=headers, timeout=TIMEOUT, verify=False, stream=True)
            response.raise_for_status()
            
            # 检查内容类型
            content_type = response.headers.get('Content-Type', '')
            if not content_type.startswith('image/'):
                print(f'  ⚠ 警告: 内容类型不是图片 ({content_type})')
            
            # 检查文件大小
            content_length = response.headers.get('Content-Length')
            if content_length and int(content_length) > MAX_IMAGE_SIZE:
                print(f'  ✗ 错误: 文件过大 ({content_length} bytes)')
                return False
            
            # 下载并保存
            total_size = 0
            with open(local_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        total_size += len(chunk)
                        if total_size > MAX_IMAGE_SIZE:
                            print(f'  ✗ 错误: 文件过大')
                            os.remove(local_path)
                            return False
            
            print(f'  ✓ 下载成功 ({total_size} bytes)')
            return True
            
        except requests.exceptions.RequestException as e:
            print(f'  ✗ 尝试 {attempt + 1}/{MAX_RETRIES} 失败: {e}')
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY)
            else:
                print(f'  ✗ 下载失败，已重试 {MAX_RETRIES} 次')
                return False
        except Exception as e:
            print(f'  ✗ 下载出错: {e}')
            return False
    
    return False

def main():
    """主函数"""
    print('=' * 60)
    print('迁移剩余的"常用"站点图标到本地存储')
    print('=' * 60)
    
    ensure_upload_dir()
    
    success_count = 0
    fail_count = 0
    
    for icon_info in ICONS_TO_DOWNLOAD:
        local_path = UPLOAD_DIR / icon_info['local_name']
        
        # 如果文件已存在，跳过
        if local_path.exists():
            print(f'\n✓ {icon_info["name"]} 已存在，跳过: {local_path}')
            success_count += 1
            continue
        
        if download_image(icon_info['url'], local_path, icon_info['name']):
            success_count += 1
        else:
            fail_count += 1
    
    print('\n' + '=' * 60)
    print(f'迁移完成: 成功 {success_count} 个，失败 {fail_count} 个')
    print('=' * 60)
    
    if fail_count > 0:
        print('\n失败的图标需要手动下载或检查网络连接。')
        sys.exit(1)

if __name__ == '__main__':
    main()

