#!/bin/bash

# 设置UTF-8环境变量
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8
export NODE_OPTIONS="--no-deprecation"

# 确保终端支持UTF-8
export TERM=xterm-utf8

# 运行测试脚本
echo "正在启动测试，使用UTF-8编码..."
node --input-encoding=utf8 --output-encoding=utf8 robust-test.js