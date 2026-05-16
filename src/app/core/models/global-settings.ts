export interface Settings {
    settingKey:string;
    accessTokenLifetime:number;
    refreshTokenLifetime:number;
}

export type UpdateGlobalsettingsDto = Partial<Omit<Settings,
    'settingKey' 
>>;