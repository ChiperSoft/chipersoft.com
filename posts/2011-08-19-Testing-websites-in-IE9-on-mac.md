---
layout: post
title: "Testing websites in IE7 / IE8 / IE9 on a Mac"
alias: [/view/516, /view/516/Testing_websites_in_IE7__IE8__IE9_on_a_Mac, /view/516/Testing_websites_in_IE9_on_a_Mac]
---

Went looking for information on this today to link to someone and couldn't find anything recent, so I figured I'd write one up myself.  Here's a simple process for getting a 100% legal copy of IE9 running on your mac using disk images provided by Microsoft themselves.

1. Download and install a copy of [virtualbox](http://www.virtualbox.org/), it's a free virtualization program like VMWare or Parallels.  Make sure you have the command line utilities checked in the installer.

2. Download the official [Microsoft Application Compatibility Virtual PC Image](http://www.microsoft.com/download/en/details.aspx?id=11575) for IE9.  As of this writing the latest versions are as of August 16th, 2011.  The IE9 image is a seven part self extracting RAR file.  Images are also available for IE7 and IE8.  This image contains a fully legal copy of Microsoft Windows 7, licensed for developer debugging use in a virtual machine only.

3. Use unrar (installed via macports or homebrew) or [The Unarchiver](http://wakaba.c3.cx/s/apps/unarchiver.html) to extra the multipart archive.  This will result in two files: `Windows 7.vhd` and `Windows 7.vmc`.  You can discard the vmc file.

4. Open the terminal and `cd` to the directory you extracted the vhd file into.  Run the following command:

  `VBoxManage clonehd "Windows 7.vhd" Windows_7_IE9.vdi`

5. Move the resulting .vdi file into a safe location.  By default VirtualBox puts its disk images in a unique folder inside `~/VirtualBox VMs`, but I prefer them to be on a separate disk partition.

6. Launch VirtualBox and click the New button on the toolbar (or select New... from the Machine menu).  This will launch the new virtual machine wizard.  Name the machine however you want and select Windows 7 from the Operating System Version menu.

  ![](http://i.imgur.com/jMvhK.png)

7. VirtualBox will allocate 512MB by default, which in my experience is enough for basic web testing, you may wish to give it more.

  ![](http://i.imgur.com/jqvo4.png)

8. When prompted for the hard disk, choose "Use existing hard disk" and click on the browse icon to the right of the menu.  Find the Windows_7_IE9.vdi file that we created in step 4.  Click through the remaining dialog panes and finish the wizard.

  ![](http://i.imgur.com/Uv2R0.png)
  ![](http://i.imgur.com/6YBXH.png)

9. Due to an incompatibility with VirtualBox and VirtualPC, this disk image will Bluescreen when you attempt to launch it, so there is one more thing that has to be changed to get it working.  Select the new virtual machine and click on the Settings button.  Switch to the Storage tab.  By default VirtualBox places the boot media on the SATA controller; you need to move it to the IDE controller.  

  ![](http://i.imgur.com/grn0R.png)

  Do this by selecting the IDE controller and choosing Add Hard Disk from the plus button menu.  Select the .vdi file from the list and click OK.  Now remove that same drive from the SATA Controller by selecting it and clicking the minus button.  Click OK.

10. Select your newly made Windows 7 virtual machine and click Start.

11. When you get to the windows login screen, choose Administrator.  The login password is "Password1"

12. Windows will tell you that the copy you are using is non-genuine. Microsoft does not issue valid keys with these images, as they are intended to be temporary, and their official stance is to just reset the disk image when the trial expires (seriously, it's in that link above).  

   ![](http://i.imgur.com/ayVcy.png)

  Click cancel on the activation dialog box so it takes you to the desktop.  Double click on the Command Prompt icon and type in the following:

	`slmgr –rearm`
	
  This command resets the genuine advantage countdown timer to 30 days so that it will stop bugging you every time you launch it.  Unfortunately, Windows Security Essentials will continue to bug you about it, so feel free to disable that.  A dialog will popup telling you to restart, but we don't want to do that yet.

13. Press the command key to get Windows to release your mouse, and choose "Install Guest Additions" from the Devices menu in Virtualbox.  Windows will popup an AutoPlay confirmation, click "Run VBoxWindowsAdditions.exe".  An installer will launch, click through all the dialogs.  When Windows Security prompts for permission, click Install.  

   ![](http://i.imgur.com/8rKj9.png)

  Finally, when it asks to restart, let it.

14. The final step is optional, and that's to enable to auto-login feature so you don't have to enter the password every time you launch the machine.  [This article on MSDN will show you how to do that.](http://channel9.msdn.com/Blogs/coolstuff/Tip-Auto-Login-Your-Windows-7-User-Account)

Congratulations, you now have a 100% legal copy of IE9 on your Mac.  These disk images are valid for 3 months from the date they were made (The August 2011 images expire November 17, 2011).  You will need to repeat this process for the new images when they come out.

If you need to configure Windows for any local virtualhosts, the file you need is `C:\Windows\System32\drivers\etc\hosts` (note, you need to be an Administrator to save the file), and the IP to forward to is 10.0.2.2 (which is also localhost).

The August 2011 IE9 disk image also comes preinstalled with Google Chrome, Firefox 4, Adobe Flash 10.2, and a hand-full of other useful development tools.