export interface IRemotedAppUrl {
  brand: string;
  product: string;
  url: string;
  id: string;
}

export interface IAppInstallationParameters {
  ValueTagMapping: {
    [brandProductTag: string]: IRemotedAppUrl;
  },
  ValueToValueMapping: {
    [source: string]: string
  }
}