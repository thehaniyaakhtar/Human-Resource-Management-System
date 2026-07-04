#!/bin/bash
cd "$(dirname "$0")/backend"
conda run --no-capture-output -n hrms uvicorn main:app --reload --host 0.0.0.0 --port 8000
