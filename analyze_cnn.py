#!/usr/bin/env python3
"""
Script para analizar la estructura de CNN en Español
"""

import requests
from bs4 import BeautifulSoup

def analyze_cnn_structure():
    """Analiza la estructura de CNN en Español"""
    try:
        # Analizar la estructura de CNN en Español
        url = 'https://cnnespanol.cnn.com/mundo/'
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')

        print('=== ANÁLISIS DE CNN EN ESPAÑOL ===')
        print(f'URL analizada: {url}')
        print(f'Status: {response.status_code}')

        # Buscar diferentes tipos de elementos
        print('\n📰 Elementos encontrados:')
        print(f'Articles: {len(soup.find_all("article"))}')
        print(f'Divs con clase story: {len(soup.find_all("div", class_=lambda x: x and "story" in x.lower()))}')
        print(f'Divs con clase item: {len(soup.find_all("div", class_=lambda x: x and "item" in x.lower()))}')
        print(f'Enlaces totales: {len(soup.find_all("a", href=True))}')

        # Buscar enlaces que parecen noticias
        links = soup.find_all('a', href=True)
        news_links = []
        for link in links:
            href = link.get('href', '')
            text = link.get_text(strip=True)
            if len(text) > 20 and len(text) < 200 and ('/' in href):
                news_links.append((text[:50], href))

        print(f'\n🔗 Enlaces que parecen noticias: {len(news_links)}')
        for i, (text, href) in enumerate(news_links[:10]):
            print(f'{i+1}. {text}... -> {href[:50]}...')
            
        # Analizar otras secciones
        print('\n=== ANÁLISIS DE OTRAS SECCIONES ===')
        sections = ['/deportes/', '/economia/', '/americas/', '/internacional/']
        
        for section in sections:
            try:
                section_url = f'https://cnnespanol.cnn.com{section}'
                section_response = requests.get(section_url, headers=headers)
                section_soup = BeautifulSoup(section_response.content, 'html.parser')
                
                section_links = section_soup.find_all('a', href=True)
                section_news = []
                for link in section_links:
                    href = link.get('href', '')
                    text = link.get_text(strip=True)
                    if len(text) > 20 and len(text) < 200 and ('/' in href):
                        section_news.append((text[:50], href))
                
                print(f'{section}: {len(section_news)} enlaces encontrados')
                
            except Exception as e:
                print(f'{section}: Error - {e}')
                
    except Exception as e:
        print(f'Error general: {e}')

if __name__ == "__main__":
    analyze_cnn_structure()
