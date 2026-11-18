[Setup]
AppId={{8F9D4A1E-5B2C-4E7A-9C3D-1F2A3B4C5D6E}
AppName=Consola de Audio
AppVersion=0.1.0
AppPublisher=oacoello
AppPublisherURL=https://github.com/oacoello/mixer-console
DefaultDirName={localappdata}\Programs\Consola de Audio
DefaultGroupName=Consola de Audio
PrivilegesRequired=lowest
OutputDir=..\dist
OutputBaseFilename=ConsolaDeAudio-Setup-0.1.0
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
UninstallDisplayIcon={app}\production-mixer.exe

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "..\target\release\production-mixer.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\target\release\WebView2Loader.dll"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\Consola de Audio"; Filename: "{app}\production-mixer.exe"
Name: "{autodesktop}\Consola de Audio"; Filename: "{app}\production-mixer.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\production-mixer.exe"; Description: "{cm:LaunchProgram,Consola de Audio}"; Flags: nowait postinstall skipifsilent
