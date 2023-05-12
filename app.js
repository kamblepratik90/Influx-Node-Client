// repl.repl.ignoreUndefined=true

const {InfluxDB, Point} = require('@influxdata/influxdb-client');

const token = process.env.INFLUXDB_TOKEN || "2qr879LlhqMknYyTzZgWr7jA7Swd8hrLH1rsw2uydAHc_ai7GgwH7mBKPPGeVsGjnydUBBN9WG4wqvkwjxjLAw==";
const url = 'https://eu-central-1-1.aws.cloud2.influxdata.com';

const client = new InfluxDB({url, token});

let org = `Test Zero`
let bucket = `mybucket`

let writeClient = client.getWriteApi(org, bucket, 'ns')

for (let i = 0; i < 5; i++) {
  let point = new Point('measurement1')
    .tag('tagname1', 'tagvalue1')
    .intField('field1', i)

  void setTimeout(() => {
    writeClient.writePoint(point)
  }, i * 1000) // separate points by 1 second

  void setTimeout(() => {
    writeClient.flush()
  }, 5000)
}