export interface IRemotedAppUrl {
  brand: string;
  product: string;
  url: string;
  id: string;
}

export interface AppInstallationParameters {
  ValueTagMapping: {
    [brandProductTag: string]: IRemotedAppUrl;
  },
  ValueToValueMapping: {
    [source: string]: string
  }
}