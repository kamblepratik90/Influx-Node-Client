// repl.repl.ignoreUndefined=true

const { InfluxDB, Point } = require('@influxdata/influxdb-client');

// const token = process.env.INFLUXDB_TOKEN || "2qr879LlhqMknYyTzZgWr7jA7Swd8hrLH1rsw2uydAHc_ai7GgwH7mBKPPGeVsGjnydUBBN9WG4wqvkwjxjLAw==";
// const url = 'https://eu-central-1-1.aws.cloud2.influxdata.com';
const token = process.env.INFLUXDB_TOKEN || "56u8DJoclvwp1dYsGT1CvDfyPh8q3X-yRn2Gcvn_3RWkAtlu8BVl1kAh-5EqqOszZ1XqkH0AlnTFAFFNKkMhsg==";
const url = 'http://localhost:8086/';

async function main() {
  const client = new InfluxDB({ url, token });

  // let org = `Test Zero`
  // let bucket = `mybucket`
  let org = `Test Local Zero`
  let bucket = `Test`

  // Write
  // let writeClient = client.getWriteApi(org, bucket, 'ns')

  // for (let i = 0; i < 5; i++) {
  //   let point = new Point('measurement1')
  //     .tag('tagname1', 'tagvalue1')
  //     .intField('field1', i)

  //   console.log("i:", i);  

  //   void setTimeout(() => {
  //     writeClient.writePoint(point)
  //   }, i * 1000) // separate points by 1 second

  //   void setTimeout(() => {
  //     writeClient.flush()
  //   }, 5000)
  // }


  // Read
  let readClient = client.getQueryApi(org);

  // let queryRaw = `SELECT * FROM measurement1`;
  // let result = await readClient.collectRows(queryRaw);
  // console.log("result: ", JSON.stringify(result));
  
  const fluxQuery =
  `from(bucket:"${bucket}") 
  |> range(start: -1d) 
  |> filter(fn: (r) => r._measurement == "measurement1")`

  // await iterateRows(readClient, fluxQuery);
  // await queryRows(readClient, fluxQuery);
  // collectRows(readClient, fluxQuery).catch((error) => console.error('CollectRows ERROR', error))
// queryRaw(readClient, fluxQuery).catch((error) => console.error('QueryRaw ERROR', error))
// queryLines(readClient, fluxQuery)
  iterateLines(readClient, fluxQuery).catch((error) => console.error('\nIterateLines ERROR', error))
}

// Execute query and receive table metadata and table row values using async iterator.
async function iterateRows(queryApi, fluxQuery) {
  console.log('*** IterateRows ***')
  for await (const {values, tableMeta} of queryApi.iterateRows(fluxQuery)) {
    // the following line creates an object for each row
    const o = tableMeta.toObject(values)
    // console.log(JSON.stringify(o, null, 2))
    console.log(
      // `${o._time} ${o._measurement} in '${o.tagname1}' : ${o._field}=${o._value}`
      `${JSON.stringify(o)}`
    )

    // alternatively, you can get only a specific column value without
    // the need to create an object for every row
    // console.log(tableMeta.get(row, '_time'))
  }
  console.log('\nIterateRows SUCCESS')
}

// Execute query and receive table metadata and rows in a result observer.
function queryRows(queryApi, fluxQuery) {
  console.log('*** QueryRows ***')
  queryApi.queryRows(fluxQuery, {
    next: (row, tableMeta) => {
      // the following line creates an object for each row
      const o = tableMeta.toObject(row)
      // console.log(JSON.stringify(o, null, 2))
      console.log(
        // `${o._time} ${o._measurement} in '${o.location}' (${o.example}): ${o._field}=${o._value}`
      `${JSON.stringify(o)}`
      )

      // alternatively, you can get only a specific column value without
      // the need to create an object for every row
      // console.log(tableMeta.get(row, '_time'))
    },
    error: (error) => {
      console.error(error)
      console.log('\nQueryRows ERROR')
    },
    complete: () => {
      console.log('\nQueryRows SUCCESS')
    },
  })
}

// Execute query and collect result rows in a Promise.
// Use with caution, it copies the whole stream of results into memory.
async function collectRows(queryApi, fluxQuery) {
  console.log('\n*** CollectRows ***')
  const data = await queryApi.collectRows(
    fluxQuery //, you can also specify a row mapper as a second argument
  )
  data.forEach((x) => console.log(JSON.stringify(x)))
  console.log('\nCollect ROWS SUCCESS')
}

// Execute query and return the whole result as a string.
// Use with caution, it copies the whole stream of results into memory.
async function queryRaw(queryApi, fluxQuery) {
  const result = await queryApi.queryRaw(fluxQuery)
  console.log(result)
  console.log('\nQueryRaw SUCCESS')
}

// Execute query and receive result CSV lines in an observer
function queryLines(queryApi, fluxQuery) {
  queryApi.queryLines(fluxQuery, {
    next: (line) => {
      console.log(line)
    },
    error: (error) => {
      console.error(error)
      console.log('\nQueryLines ERROR')
    },
    complete: () => {
      console.log('\nQueryLines SUCCESS')
    },
  })
}

// Execute query and receive result csv lines using async iterable
async function iterateLines(queryApi, fluxQuery) {
  for await (const line of queryApi.iterateLines(fluxQuery)) {
    console.log(line)
  }
  console.log('\nIterateLines SUCCESS')
}

main();