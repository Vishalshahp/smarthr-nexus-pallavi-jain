@echo off
title Stop SmartHR Nexus
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0stop-smarthr.ps1"
