import * as mockedIonicCore from "@ionic/core";
import * as mockedCapacitorBrowser from "@capacitor/browser";
import {
  GithubReleaseAsset,
  GithubReleaseInfo,
  appVersion,
  downloadLatestRelease,
  isNewVersionAvailable,
} from "../data/AppVersion";

jest.mock("@capacitor/browser");

describe("Get information about latest release", () => {
  test("There are no new version", async () => {
    // desktop
    jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(false);
    // mobileweb
    jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(false);
    // android
    jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(true);

    globalThis.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        html_url: "https://some-html-url.com",
        tag_name: appVersion,
        draft: false,
        assets: [
          {
            content_type: "application/vnd.android.package-archive",
            browser_download_url: "https://some-url-to-apk-file.com",
          },
        ] satisfies GithubReleaseAsset[],
      } satisfies GithubReleaseInfo),
    });
    await expect(isNewVersionAvailable()).resolves.toEqual(false);
  });

  test("New version available", async () => {
    // desktop
    jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(false);
    // mobileweb
    jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(false);
    // android
    jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(true);

    globalThis.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        html_url: "https://some-html-url.com",
        tag_name: "v999.999.999",
        draft: false,
        assets: [
          {
            content_type: "application/vnd.android.package-archive",
            browser_download_url: "https://some-url-to-apk-file.com",
          },
        ] satisfies GithubReleaseAsset[],
      } satisfies GithubReleaseInfo),
    });
    await expect(isNewVersionAvailable()).resolves.toEqual(true);
  });

  test("Web version", async () => {
    // desktop
    jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(false);
    // mobileweb
    jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(true);
    // android
    jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(false);

    globalThis.fetch = jest.fn();

    await expect(isNewVersionAvailable()).resolves.toEqual(false);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test("Web version on Android", async () => {
    // desktop
    jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(false);
    // mobileweb
    jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(true);
    // android
    jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(true);

    globalThis.fetch = jest.fn();

    await expect(isNewVersionAvailable()).resolves.toEqual(false);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test("Web version on Desktop", async () => {
    // desktop
    jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(true);
    // mobileweb
    jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(false);
    // android
    jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(false);

    globalThis.fetch = jest.fn();

    await expect(isNewVersionAvailable()).resolves.toEqual(false);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test("Empty assets list", async () => {
    // desktop
    jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(false);
    // mobileweb
    jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(false);
    // android
    jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(true);

    globalThis.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        html_url: "https://some-html-url.com",
        tag_name: appVersion,
        draft: false,
        assets: [] satisfies GithubReleaseAsset[],
      } satisfies GithubReleaseInfo),
    });

    await expect(isNewVersionAvailable()).rejects.toThrow(
      "Can't find apk files in assets list",
    );
  });
});

test("Download latest release", async () => {
  // desktop
  jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(false);
  // mobileweb
  jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(false);
  // android
  jest.spyOn(mockedIonicCore, "isPlatform").mockReturnValueOnce(true);

  mockedCapacitorBrowser.Browser.open = jest.fn().mockResolvedValueOnce(true);

  globalThis.fetch = jest.fn().mockResolvedValue({
    json: jest.fn().mockResolvedValue({
      html_url: "https://some-html-url.com",
      tag_name: "v999.999.999",
      draft: false,
      assets: [
        {
          content_type: "application/vnd.android.package-archive",
          browser_download_url: "https://some-url-to-apk-file.com",
        },
      ] satisfies GithubReleaseAsset[],
    } satisfies GithubReleaseInfo),
  });

  await expect(downloadLatestRelease()).resolves.not.toThrow();
  expect(mockedCapacitorBrowser.Browser.open).toHaveBeenCalledWith({
    url: "https://some-html-url.com",
  });
});
