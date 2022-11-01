import fs from 'fs'
import Core from './Core'

fs.writeFileSync(process.env.PID_FILE, process.pid.toString())

new Core()