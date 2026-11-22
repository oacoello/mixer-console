[Setup]
AppId={{8F9D4A1E-5B2C-4E7A-9C3D-1F2A3B4C5D6E}
AppName=My mixer
AppVersion=1.0
AppPublisher=oacoello
AppPublisherURL=https://github.com/oacoello/mixer-console
DefaultDirName={localappdata}\Programs\My mixer
DefaultGroupName=My mixer
PrivilegesRequired=lowest
OutputDir=..\dist
OutputBaseFilename=MyMixer-setup-1.0
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
Name: "{group}\My mixer"; Filename: "{app}\production-mixer.exe"
Name: "{autodesktop}\My mixer"; Filename: "{app}\production-mixer.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\production-mixer.exe"; Description: "{cm:LaunchProgram,My mixer}"; Flags: nowait postinstall skipifsilent
