setlocal enabledelayedexpansion
:: 设置代码页为UTF-8
chcp 65001 >nul
for %%I in (*.jpg) do (
    :: 分离文件名和扩展名
    set "filename=%%~nI"
    set "extension=%%~xI"
    :: 替换文件名中的全角句号和逗号
    set "newname=!filename:QQQ_=QD_!"
    set "newname=!newname:，=,!"
    set "newname=!newname:？=?!"
    set "newname=!newname:（=(!"
    set "newname=!newname:）=)!"
    :: 组合新的文件名和原始扩展名
    set "finalname=!newname!!extension!"
    :: 移动并重命名文件到目标目录
    if not "%%I"=="!finalname!!extension!" (
        move /Y "%%I" "!finalname!"
    )
)