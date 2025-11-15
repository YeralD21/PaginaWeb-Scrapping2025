import re
import requests

CHANNELS = [
    "@DiarioCorreoPeru",
    "@cnnee",
    "@elcomerciope",
    "@elcomercio",
    "@elcomercio_peru",
    "@elcomerciopeoficial",
    "@diarioelcomercio",
    "@diarioelcomerciope",
    "@elcomerciopeprensa",
    "@rpp",
    "@rppnoticias",
    "@peru21pe",
    "@peru21",
    "@peru21tv",
    "@diarioperu21",
    "@peru21noticias",
    "channel/UCyjzd3PHwG6TgCZCHHZWBYA",
    "channel/UCuRsgsgZXkgjhHhbKEwJ1_A",
    "channel/UChOF38ucKKJm7BZqrB_55LA",
    "channel/UC4vzdGCAYyE4DLKJZQC3cZQ",
    "channel/UCQi90C5nDOa5qe6OOmytdCA",
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0"
}


def resolve_channel_id(handle: str) -> str:
    url = f"https://www.youtube.com/{handle}/about"
    resp = requests.get(url, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    match = re.search(r'"channelId":"(UC[0-9A-Za-z_-]{22})"', resp.text)
    if match:
        return match.group(1)
    return ""


def main():
    for handle in CHANNELS:
        try:
            channel_id = resolve_channel_id(handle)
            print(f"{handle}: {channel_id or 'no encontrado'}")
        except Exception as exc:
            print(f"{handle}: error -> {exc}")


if __name__ == "__main__":
    main()

