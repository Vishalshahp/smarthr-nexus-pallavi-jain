$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut('C:\Users\VISHAL\Desktop\SmartHR Nexus (Pallavi Jain).lnk')
$Shortcut.TargetPath = 'C:\Users\VISHAL\Desktop\Pallavi jain\Click_To_Open_Project.bat'
$Shortcut.WorkingDirectory = 'C:\Users\VISHAL\Desktop\Pallavi jain'
$Shortcut.Description = 'Launch SmartHR Nexus AI Workforce Platform (Pallavi Jain)'
$Shortcut.IconLocation = 'imageres.dll,102'
$Shortcut.Save()

$FolderShortcut = $WshShell.CreateShortcut('C:\Users\VISHAL\Desktop\Pallavi jain\SmartHR Nexus.lnk')
$FolderShortcut.TargetPath = 'C:\Users\VISHAL\Desktop\Pallavi jain\Click_To_Open_Project.bat'
$FolderShortcut.WorkingDirectory = 'C:\Users\VISHAL\Desktop\Pallavi jain'
$FolderShortcut.Description = 'Launch SmartHR Nexus AI Workforce Platform'
$FolderShortcut.IconLocation = 'imageres.dll,102'
$FolderShortcut.Save()

$StopShortcut = $WshShell.CreateShortcut('C:\Users\VISHAL\Desktop\Stop SmartHR Nexus (Pallavi Jain).lnk')
$StopShortcut.TargetPath = 'C:\Users\VISHAL\Desktop\Pallavi jain\STOP_SmartHR.bat'
$StopShortcut.WorkingDirectory = 'C:\Users\VISHAL\Desktop\Pallavi jain'
$StopShortcut.Description = 'Stop SmartHR Nexus Servers'
$StopShortcut.IconLocation = 'imageres.dll,98'
$StopShortcut.Save()

Write-Host "Desktop shortcuts created successfully!"
