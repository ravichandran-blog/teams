import { PreventIframe } from "express-msteams-host";

/**
 * Used as place holder for the decorators
 */
@PreventIframe("/yoTab/index.html")
@PreventIframe("/yoTab/config.html")
@PreventIframe("/yoTab/remove.html")
export class YoTab {
}
