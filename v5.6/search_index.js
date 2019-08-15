var documenterSearchIndex = {"docs":
[{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"The Berkeley Tree DataBase (BTrDB) is pronounced \"Better DB\".","category":"page"},{"location":"man/explained/#BTrDB-1","page":"BTrDB Explained","title":"BTrDB","text":"","category":"section"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"A next-gen timeseries database for high-precision, high-sample-rate telemetry.","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"Problem: Existing timeseries databases are poorly equipped for a new generation of ultra-fast sensor telemetry. Specifically, millions of high-precision power meters are to be deployed throughout the power grid to help analyze and prevent blackouts. Thus, new software must be built to facilitate the storage and analysis of its data.","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"Baseline: We need 1.4M inserts/s and 5x that in reads if we are to support 1000 micro-synchrophasors per server node.  No timeseries database can do this.","category":"page"},{"location":"man/explained/#Summary-1","page":"BTrDB Explained","title":"Summary","text":"","category":"section"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"Goals: Develop a multi-resolution storage and query engine for many 100+ Hz streams at nanosecond precision—and operate at the full line rate of underlying network or storage infrastructure for affordable cluster sizes (less than six).","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"Developed at Berkeley, BTrDB offers new ways to support the aforementioned high throughput demands and allows efficient querying over large ranges.","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"Fast writes/reads","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"Measured on a 4-node cluster (large EC2 nodes):","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"53 million inserted values per second\n119 million queried values per second","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"Fast analysis","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"In under 200ms, it can query a year of data at nanosecond-precision (2.1 trillion points) at any desired window—returning statistical summary points at any desired resolution (containing a min/max/mean per point).","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"(Image: zoom)","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"High compression","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"Data is compressed by 2.93x—a significant improvement for high-precision nanosecond streams. To achieve this, a modified version of run-length encoding was created to encode the jitter of delta values rather than the delta values themselves.  Incidentally, this  outperforms the popular audio codec FLAC which was the original inspiration for this technique.","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"Efficient Versioning","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"Data is version-annotated to allow queries of data as it existed at a certain time.  This allows reproducible query results that might otherwise change due to newer realtime data coming in.  Structural sharing of data between versions is done to make this process as efficient as possible.","category":"page"},{"location":"man/explained/#The-Tree-Structure-1","page":"BTrDB Explained","title":"The Tree Structure","text":"","category":"section"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"BTrDB stores its data in a time-partitioned tree.","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"All nodes represent a given time slot. A node can describe all points within its time slot at a resolution corresponding to its depth in the tree.","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"The root node covers ~146 years. With a branching factor of 64, bottom nodes at ten levels down cover 4ns each.","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"level node width\n1 2<sup>62</sup> ns  (~146 years)\n2 2<sup>56</sup> ns  (~2.28 years)\n3 2<sup>50</sup> ns  (~13.03 days)\n4 2<sup>44</sup> ns  (~4.88 hours)\n5 2<sup>38</sup> ns  (~4.58 min)\n6 2<sup>32</sup> ns  (~4.29 s)\n7 2<sup>26</sup> ns  (~67.11 ms)\n8 2<sup>20</sup> ns  (~1.05 ms)\n9 2<sup>14</sup> ns  (~16.38 µs)\n10 2<sup>8</sup> ns   (256 ns)\n11 2<sup>2</sup> ns   (4 ns)","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"A node starts as a vector node, storing raw points in a vector of size 1024. This is considered a leaf node, since it does not point to any child nodes.","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"┌─────────────────────────────────────────────────────────────────┐\n│                                                                 │\n│                           VECTOR NODE                           │\n│                     (holds 1024 raw points)                     │\n│                                                                 │\n├─────────────────────────────────────────────────────────────────┤\n│ . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . │ <- raw points\n└─────────────────────────────────────────────────────────────────┘","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"Once this vector is full and more points need to be inserted into its time slot, the node is converted to a core node by time-partitioning itself into 64 \"statistical\" points.","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"┌─────────────────────────────────────────────────────────────────┐\n│                                                                 │\n│                            CORE NODE                            │\n│                   (holds 64 statistical points)                 │\n│                                                                 │\n├─────────────────────────────────────────────────────────────────┤\n│ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ │ <- stat points\n└─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┘\n  ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼  <- child node pointers","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"A statistical point represents a 1/64 slice of its parent's time slot. It holds the min/max/mean/count of all points inside its time slot, and points to a new node holding extra details.  When a vector node is first converted to a core node, the raw points are pushed into new vector nodes pointed to by the new statistical points.","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"level node width stat point width total nodes total stat points\n1 2<sup>62</sup> ns  (~146 years) 2<sup>56</sup> ns  (~2.28 years) 2<sup>0</sup> nodes 2<sup>6</sup> points\n2 2<sup>56</sup> ns  (~2.28 years) 2<sup>50</sup> ns  (~13.03 days) 2<sup>6</sup> nodes 2<sup>12</sup> points\n3 2<sup>50</sup> ns  (~13.03 days) 2<sup>44</sup> ns  (~4.88 hours) 2<sup>12</sup> nodes 2<sup>18</sup> points\n4 2<sup>44</sup> ns  (~4.88 hours) 2<sup>38</sup> ns  (~4.58 min) 2<sup>18</sup> nodes 2<sup>24</sup> points\n5 2<sup>38</sup> ns  (~4.58 min) 2<sup>32</sup> ns  (~4.29 s) 2<sup>24</sup> nodes 2<sup>30</sup> points\n6 2<sup>32</sup> ns  (~4.29 s) 2<sup>26</sup> ns  (~67.11 ms) 2<sup>30</sup> nodes 2<sup>36</sup> points\n7 2<sup>26</sup> ns  (~67.11 ms) 2<sup>20</sup> ns  (~1.05 ms) 2<sup>36</sup> nodes 2<sup>42</sup> points\n8 2<sup>20</sup> ns  (~1.05 ms) 2<sup>14</sup> ns  (~16.38 µs) 2<sup>42</sup> nodes 2<sup>48</sup> points\n9 2<sup>14</sup> ns  (~16.38 µs) 2<sup>8</sup> ns   (256 ns) 2<sup>48</sup> nodes 2<sup>54</sup> points\n10 2<sup>8</sup> ns   (256 ns) 2<sup>2</sup> ns   (4 ns) 2<sup>54</sup> nodes 2<sup>60</sup> points\n11 2<sup>2</sup> ns   (4 ns)  2<sup>60</sup> nodes ","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"The sampling rate of the data at different moments will determine how deep the tree will be during those slices of time. Regardless of the depth of the actual data, the time spent querying at some higher level (lower resolution) will remain fixed (quick) due to summaries provided by parent nodes.","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"...","category":"page"},{"location":"man/explained/#Appendix-1","page":"BTrDB Explained","title":"Appendix","text":"","category":"section"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"This page is written based on the following sources:","category":"page"},{"location":"man/explained/#","page":"BTrDB Explained","title":"BTrDB Explained","text":"Homepage\nWhitepaper\nCode","category":"page"},{"location":"lib/functions/#","page":"Functions","title":"Functions","text":"CurrentModule = BTrDB","category":"page"},{"location":"lib/functions/#Functions-1","page":"Functions","title":"Functions","text":"","category":"section"},{"location":"lib/functions/#","page":"Functions","title":"Functions","text":"Pages = [\"functions.md\"]","category":"page"},{"location":"lib/functions/#Metadata-Retrieval-1","page":"Functions","title":"Metadata Retrieval","text":"","category":"section"},{"location":"lib/functions/#","page":"Functions","title":"Functions","text":"collections\nstreams\nrefresh\nstream_from_uuid","category":"page"},{"location":"lib/functions/#BTrDB.collections","page":"Functions","title":"BTrDB.collections","text":"collections()\n\nReturns an array of all collection strings\n\n\n\n\n\ncollections(starts_with::String)\n\nReturns an array of all collection strings that start with a given String\n\n\n\n\n\n","category":"function"},{"location":"lib/functions/#BTrDB.streams","page":"Functions","title":"BTrDB.streams","text":"streams(collection::String)\n\nReturns an Array of Stream objects found with the supplied collection.\n\n\n\n\n\n","category":"function"},{"location":"lib/functions/#BTrDB.refresh","page":"Functions","title":"BTrDB.refresh","text":"refresh(uuid::String)\n\nReturns a new Stream object with the latest metadata from the server.\n\n\n\n\n\nrefresh(stream::Stream)\n\nReturns a new Stream object with the latest metadata from the server.\n\n\n\n\n\n","category":"function"},{"location":"lib/functions/#BTrDB.stream_from_uuid","page":"Functions","title":"BTrDB.stream_from_uuid","text":"stream_from_uuid(uuid::String)\n\nReturns a new Stream object with the latest metadata from the server. Alias for refresh(uuid::String)\n\n\n\n\n\n","category":"function"},{"location":"lib/functions/#Stream-Management-1","page":"Functions","title":"Stream Management","text":"","category":"section"},{"location":"lib/functions/#","page":"Functions","title":"Functions","text":"create\nobliterate\nsettags\nsetannotations","category":"page"},{"location":"lib/functions/#BTrDB.create","page":"Functions","title":"BTrDB.create","text":"create(uuid::String, collection::String, tags::Dict{String, String}, annotations::Dict{String, Any})\n\nCreates a new stream on the server.\n\n\n\n\n\n","category":"function"},{"location":"lib/functions/#BTrDB.obliterate","page":"Functions","title":"BTrDB.obliterate","text":"obliterate(uuid::String)\n\nDeletes a Stream with a given UUID from the server permanently.\n\n\n\n\n\nobliterate(stream::Stream)\n\nDeletes a Stream from the server permanently.\n\n\n\n\n\n","category":"function"},{"location":"lib/functions/#BTrDB.settags","page":"Functions","title":"BTrDB.settags","text":"settags(stream::Stream, tags::Dict{String, String})\n\nOverwrites existing tags.\n\nNotes\n\nTags are used internally by the system and are not generally meant to be manipulated by end users.\n\nIf you would like to add your own custom metadata, please use annotations.\n\n\n\n\n\n","category":"function"},{"location":"lib/functions/#BTrDB.setannotations","page":"Functions","title":"BTrDB.setannotations","text":"setannotations(stream::Stream, annotations::Dict{String, Any})\n\nOverwrites existing annotations.\n\nNotes\n\nStream annotations are provided so that you may store Stream related custom metadata.\n\nYou cannot delete annotations at this time though this will change in a future update.\n\n\n\n\n\n","category":"function"},{"location":"lib/functions/#Data-Manipulation-1","page":"Functions","title":"Data Manipulation","text":"","category":"section"},{"location":"lib/functions/#","page":"Functions","title":"Functions","text":"insert\ndelete\nflush","category":"page"},{"location":"lib/functions/#BTrDB.insert","page":"Functions","title":"BTrDB.insert","text":"insert(uuid::String, data::Array{Pair{Int64, Float64},1})\n\nInsert new data in the form (time, value) into the series.\n\nInserts a list of new (time, value) tuples into the series. The tuples in the list need not be sorted by time. If the arrays are larger than appropriate, this function will automatically chunk the inserts. As a consequence, the insert is not necessarily atomic, but can be used with a very large array.\n\nArguments\n\nuuid : a String for the stream's unique identifier\ndata : an Array of Pair objects representings points where the first pair item is the time (Int64) and the second item is the value (Float64)\n\n\n\n\n\ninsert(stream::Stream, data::Array{Pair{Int64, Float64},1})\n\nInsert new data in the form (time, value) into the series.\n\nInserts a list of new (time, value) tuples into the series. The tuples in the list need not be sorted by time. If the arrays are larger than appropriate, this function will automatically chunk the inserts. As a consequence, the insert is not necessarily atomic, but can be used with a very large array.\n\nArguments\n\nstream : the Stream to use for data insertion\ndata : an Array of Pair objects representings points where the first pair item is the time (Int64) and the second item is the value (Float64)\n\n\n\n\n\n","category":"function"},{"location":"lib/functions/#BTrDB.delete","page":"Functions","title":"BTrDB.delete","text":"delete(uuid::String, start::Int64, stop::Int64)\n\n\"Delete\" all points between start (inclusive) and end (exclusive), both in nanoseconds. As BTrDB has persistent multiversioning, the deleted points will still exist as part of an older version of the stream.\n\nArguments\n\nuuid : the String UUID of the stream to use for data deletion\nstart : the start time (Int64) in nanoseconds for the range to be deleted (inclusive)\nstop : the end time (Int64) in nanoseconds for the range to be deleted (exclusive)\n\n\n\n\n\ndelete(stream::Stream, start::Int64, stop::Int64)\n\n\"Delete\" all points between start (inclusive) and end (exclusive), both in nanoseconds. As BTrDB has persistent multiversioning, the deleted points will still exist as part of an older version of the stream.\n\nArguments\n\nstream : the Stream to use for data deletion\nstart : the start time (Int64) in nanoseconds for the range to be deleted (inclusive)\nstop : the end time (Int64) in nanoseconds for the range to be deleted (exclusive)\n\n\n\n\n\n","category":"function"},{"location":"lib/functions/#BTrDB.flush","page":"Functions","title":"BTrDB.flush","text":"flush(uuid::String)\n\nForces the database to commit buffered data.  This function is generally not needed by end users.\n\n\n\n\n\nflush(stream::Stream)\n\nForces the database to commit buffered data.  This function is generally not needed by end users.\n\n\n\n\n\n","category":"function"},{"location":"lib/functions/#Data-Retrieval-1","page":"Functions","title":"Data Retrieval","text":"","category":"section"},{"location":"lib/functions/#","page":"Functions","title":"Functions","text":"nearest\nearliest\nlatest\nvalues\nwindows\naligned_windows","category":"page"},{"location":"lib/functions/#BTrDB.nearest","page":"Functions","title":"BTrDB.nearest","text":"nearest(stream::Stream, time::Int64, version::Int=0, backward::Bool=false)\n\nFinds the closest point in the stream to a specified time.\n\nReturn the point nearest to the specified time in nanoseconds since Epoch in the stream with version while specifying whether to search forward or backward in time. If backward is false, the returned point will be >= time. If backward is true, the returned point will be < time. The version of the stream used to satisfy the query is returned.\n\nArguments\n\nstream : The Stream object to search\ntime : The Int64 time (in nanoseconds since Epoch) to search near\nversion : Int64 version of the stream to use in search\nbackward : boolean (true) to search backwards from time, else false for forward\n\n\n\n\n\n","category":"function"},{"location":"lib/functions/#BTrDB.earliest","page":"Functions","title":"BTrDB.earliest","text":"earliest(stream::Stream, version::Int=0)\n\nReturns the first point of data in the stream.\n\nArguments\n\nstream : The Stream object to search\nversion : Int64 version of the stream to use in search\n\n\n\n\n\n","category":"function"},{"location":"lib/functions/#BTrDB.latest","page":"Functions","title":"BTrDB.latest","text":"latest(stream::Stream, version::Int=0)\n\nReturns last point of data in the stream.\n\nArguments\n\nstream : The Stream object to search\nversion : Int64 version of the stream to use in search\n\n\n\n\n\n","category":"function"},{"location":"lib/functions/#BTrDB.values","page":"Functions","title":"BTrDB.values","text":"values(stream::Stream, start::Int64, stop::Int64, version::Int=0)\n\nRead raw values from BTrDB between time [start, stop) in nanoseconds.\n\nRawValues queries BTrDB for the raw time series data points between start and end time, both in nanoseconds since the Epoch for the specified stream version.\n\nArguments\n\nstart : The start time (Int64) in nanoseconds for the range to be queried (inclusive)\nstop : The end time (Int64) in nanoseconds for the range to be queried (exclusive)\nversion : Int64 version of the stream to use when querying data\n\nNotes\n\nNote that the raw data points are the original values at the sensor's native sampling rate (assuming the time series represents measurements from a sensor). This is the lowest level of data with the finest time granularity. In the tree data structure of BTrDB, this data is stored in the vector nodes.\n\n\n\n\n\n","category":"function"},{"location":"lib/functions/#BTrDB.windows","page":"Functions","title":"BTrDB.windows","text":"windows(stream::Stream, start::Int64, stop::Int64, width::Int, depth::Int, version::Int=0)\n\nRead arbitrarily-sized windows of data from BTrDB.  StatPoint objects will be returned representing the data for each window.\n\nArguments\n\nstart : The start time (Int64) in nanoseconds for the range to be queried (inclusive)\nstop : The end time (Int64) in nanoseconds for the range to be queried (exclusive)\nversion : Int64 version of the stream to use when querying data\nwidth :  the number (Int) of nanoseconds in each window, subject to the depth parameter.\ndepth : The precision of the window duration as a power of 2 in nanoseconds. E.g 30 would make the window duration accurate to roughly 1 second\n\nNotes\n\nWindows returns arbitrary precision windows from BTrDB. It is slower than AlignedWindows, but still significantly faster than RawValues. Each returned window will be width nanoseconds long. start is inclusive, but end is exclusive (e.g if end < start+width you will get no results). That is, results will be returned for all windows that start at a time less than the end timestamp. If (end - start) is not a multiple of width, then end will be decreased to the greatest value less than end such that (end - start) is a multiple of width (i.e., we set end = start + width * floordiv(end - start, width). The depth parameter is an optimization that can be used to speed up queries on fast queries. Each window will be accurate to 2^depth nanoseconds. If depth is zero, the results are accurate to the nanosecond. On a dense stream for large windows, this accuracy may not be required. For example for a window of a day, +- one second may be appropriate, so a depth of 30 can be specified. This is much faster to execute on the database side.\n\n\n\n\n\n","category":"function"},{"location":"lib/functions/#BTrDB.aligned_windows","page":"Functions","title":"BTrDB.aligned_windows","text":"aligned_windows(stream::Stream, start::Int64, stop::Int64, pointwidth::Int, version::Int=0)\n\nRead statistical aggregates of windows of data from BTrDB.\n\nQuery BTrDB for aggregates (or roll ups or windows) of the time series with version between time start (inclusive) and end (exclusive) in nanoseconds. Each point returned is a statistical aggregate of all the raw data within a window of width 2**pointwidth nanoseconds. These statistical aggregates currently include the mean, minimum, and maximum of the data and the count of data points composing the window.\n\nNote that start is inclusive, but end is exclusive. That is, results will be returned for all windows that start in the interval [start, end). If end < start+2^pointwidth you will not get any results. If start and end are not powers of two, the bottom pointwidth bits will be cleared. Each window will contain statistical summaries of the window. Statistical points with count == 0 will be omitted.\n\nArguments\n\nstart : The start time (Int64) in nanoseconds for the range to be queried (inclusive)\nstop : The end time (Int64) in nanoseconds for the range to be queried (exclusive)\npointwidth : the number of ns between data points (2**pointwidth)\nversion : Int64 version of the stream to use when querying data\n\nNotes\n\nAs the window-width is a power-of-two, it aligns with BTrDB internal tree data structure and is faster to execute than windows().\n\n\n\n\n\n","category":"function"},{"location":"man/getting_started/#Getting-Started-1","page":"Getting Started","title":"Getting Started","text":"","category":"section"},{"location":"man/getting_started/#Installation-1","page":"Getting Started","title":"Installation","text":"","category":"section"},{"location":"man/getting_started/#","page":"Getting Started","title":"Getting Started","text":"At the moment, you will need to install directly from our GitHub repo.","category":"page"},{"location":"man/getting_started/#","page":"Getting Started","title":"Getting Started","text":"julia> Pkg.clone(\"git@github.com:PingThingsIO/BTrDB.jl.git\")\nINFO: Cloning Package from git://github.com/PingThingsIO/BTrDB.jl.git\nCloning into 'BTrDB.jl'...","category":"page"},{"location":"man/getting_started/#Connecting-to-BTrDB-1","page":"Getting Started","title":"Connecting to BTrDB","text":"","category":"section"},{"location":"man/getting_started/#","page":"Getting Started","title":"Getting Started","text":"Connection to the server is handled transparently through the use of environmental variables.","category":"page"},{"location":"man/getting_started/#","page":"Getting Started","title":"Getting Started","text":"Specifically, you will need to set BTRDB_ENDPOINTS and BTRDB_API_KEY which should have been provided to you by the server administrators.","category":"page"},{"location":"man/getting_started/#","page":"Getting Started","title":"Getting Started","text":"We would suggest putting these values in your shell profile (such as .bashrc or .zshrc).  You can set these values on Unix-like operating systems with the following commands","category":"page"},{"location":"man/getting_started/#","page":"Getting Started","title":"Getting Started","text":"export BTRDB_ENDPOINTS=api.myallocation.predictivegrid.com\nexport BTRDB_API_KEY=FAC53575B9FB949C544091CCC","category":"page"},{"location":"man/concepts/#Concepts-1","page":"Concepts","title":"Concepts","text":"","category":"section"},{"location":"man/concepts/#","page":"Concepts","title":"Concepts","text":"If you are relatively new to BTrDB, then there are a few things you should be aware of about interacting with the server.  First of all, time series databases such as BTrDB are not relational databases and so they behave differently, have different access methods, and provide different guarantees.","category":"page"},{"location":"man/concepts/#","page":"Concepts","title":"Concepts","text":"The following sections provide insight into the high level objects and aspects of their behavior which will allow you to use them effectively.","category":"page"},{"location":"man/concepts/#BTrDB-Server-1","page":"Concepts","title":"BTrDB Server","text":"","category":"section"},{"location":"man/concepts/#","page":"Concepts","title":"Concepts","text":"Like most time series databases, the BTrDB server contains multiple streams of data in which each stream contains a data point at a given time.  However, BTrDB focuses on univariate data which opens a host of benefits and is one of the reasons BTrDB is able to process incredibly large amounts of data quickly and easily.","category":"page"},{"location":"man/concepts/#Points-1","page":"Concepts","title":"Points","text":"","category":"section"},{"location":"man/concepts/#","page":"Concepts","title":"Concepts","text":"Points of data within a time series make up the smallest objects you will be dealing with when making calls to the database.  Because there are different types of interactions with the database, there are different types of points that could be returned to you: :code:RawPoint and :code:StatPoint.","category":"page"},{"location":"man/concepts/#RawPoint-1","page":"Concepts","title":"RawPoint","text":"","category":"section"},{"location":"man/concepts/#","page":"Concepts","title":"Concepts","text":"The RawPoint represents a single time/value pair and is the simpler of the two types of points.  This is most useful when you need to process every single value within the stream.","category":"page"},{"location":"man/concepts/#StatPoint-1","page":"Concepts","title":"StatPoint","text":"","category":"section"},{"location":"man/concepts/#","page":"Concepts","title":"Concepts","text":"The StatPoint provides statistics about multiple points and gives aggregation values such as min, max, mean, etc.  This is most useful when you don't need to touch every individual value such as when you only need the count of the values over a range of time.","category":"page"},{"location":"man/concepts/#","page":"Concepts","title":"Concepts","text":"These statistical queries execute in time proportional to the number of results, not the number of underlying points (i.e logarithmic time) and so you can attain valuable data in a fraction of the time when compared with retrieving all of the individual values.  Due to the internal data structures, BTrDB does not need to read the underlying points to return these statistics!","category":"page"},{"location":"man/concepts/#Streams-1","page":"Concepts","title":"Streams","text":"","category":"section"},{"location":"man/concepts/#","page":"Concepts","title":"Concepts","text":"Streams represent a single series of time/value pairs.  As such, the database can hold an almost unlimited amount of individual streams.  Each stream has a collection which is similar to a \"path\" or grouping for multiple streams.  Each steam will also have a name as well as a uuid which is guaranteed to be unique across streams.","category":"page"},{"location":"man/concepts/#","page":"Concepts","title":"Concepts","text":"BTrDB data is versioned such that changes to a given stream (time series) will result in a new version for the stream.  In this manner, you can pin your interactions to a specific version ensuring the values do not change over the course of your interactions.  If you want to work with the most recent version/data then specify a version of zero (the default).","category":"page"},{"location":"man/concepts/#","page":"Concepts","title":"Concepts","text":"Each stream has a number of attributes and methods available and these are documented within the API section of this publication.  But the most common interactions by users are to access the UUID, tags, annotations, version, and underlying data.","category":"page"},{"location":"man/concepts/#","page":"Concepts","title":"Concepts","text":"Each stream uses a UUID as its unique identifier which can also be used when querying for streams.  Metadata is provided by tags and annotations which are both provided as dictionaries of data.  Tags are used internally and have very specific keys while annotations are more free-form and can be used by you to store your own metadata.","category":"page"},{"location":"lib/types/#","page":"Types","title":"Types","text":"CurrentModule = BTrDB","category":"page"},{"location":"lib/types/#Types-1","page":"Types","title":"Types","text":"","category":"section"},{"location":"lib/types/#","page":"Types","title":"Types","text":"Pages = [\"types.md\"]","category":"page"},{"location":"lib/types/#Types-specification-1","page":"Types","title":"Types specification","text":"","category":"section"},{"location":"lib/types/#","page":"Types","title":"Types","text":"Stream\nRawPoint\nStatPoint","category":"page"},{"location":"lib/types/#BTrDB.Stream","page":"Types","title":"BTrDB.Stream","text":"Stream\n\nAn object that represents a specific time series stream in the BTrDB database.\n\nConstructors\n\nStream(uuid::String, name::String, collection::String, tags::Dict{String,String},\n       annotations::Dict{String,Any}, version::Int64, propertyVersion::Int64)\nStream(data::Dict{String,Any})\nStream(uuid, name, collection, tags, annotations, version, propertyVersion)\n\nArguments\n\nuuid : a String of the stream's unique identifier\nname : a String of the stream's friendly name\ncollection : a String of the stream's collection (path) in the stream hierarchy\ntags : a Dict{String,String} of the stream's (internal use) metadata\nannotations : a Dict{String,Any} of the stream's public metadata\nversion : a Int64 that acts as a monotonically increasing version of the data\npropertyVersion : a Int64 that acts as a monotonically increasing version of the metadata\n\nNotes\n\nThe Stream constructors are used internally by any calls that will return Stream objects. In general, this is unlikely to be used by end users but is still provided in the public API.\n\n\n\n\n\n","category":"type"},{"location":"lib/types/#BTrDB.RawPoint","page":"Types","title":"BTrDB.RawPoint","text":"RawPoint\n\nA point of data representing a single position within a time series. Each point contains a read-only time and value attribute.\n\nConstructors\n\nRawPoint(time::Int64, value::Float64)\nRawPoint(data::Dict{String,Any})\nRawPoint(time, value)\n\nArguments\n\ntime : the time (Int64) of a single value in the time series (in nanoseconds since the Unix epoch)\nvalue : the value (Int64) of a time series at a single point in time\n\nNotes\n\nThe RawPoint constructors are used internally by calls such as values.\n\n\n\n\n\n","category":"type"},{"location":"lib/types/#BTrDB.StatPoint","page":"Types","title":"BTrDB.StatPoint","text":"StatPoint\n\nAn aggregated data point representing a summary or rollup of one or more points of data within a single time series.\n\nThis aggregation point provides for the min, mean, max, count, and standard deviation of all data values it spans. It is returned by windowing queries such as windows or aligned_windows.\n\nConstructors\n\nStatPoint(time::Int64, min::Float64, mean::Float64, max::Float64,\n          count::Int64, stddev::Float64)\nStatPoint(data::Dict{String,Any})\nStatPoint(time, min, mean, max, count, stddev)\n\nArguments\n\ntime : a Int64 for the time span represented by the aggregated values (in nanoseconds since the Unix epoch)\nmin : a Float64 representing the minimum value of points in this window\nmean : a Float64 representing the average value of points in this window\nmax : a Float64 representing the maximum value of points in this window\ncount : a Int64 for the number of real values in this window\nstddev : a Float64 representing the standard deviation of point values in this window\n\nNotes\n\nThe StatPoint constructors are used internally by aggregation calls such as windows and aligned_windows.\n\n\n\n\n\n","category":"type"},{"location":"#BTrDB.jl-1","page":"Introduction","title":"BTrDB.jl","text":"","category":"section"},{"location":"#","page":"Introduction","title":"Introduction","text":"Welcome to the BTrDB.jl documentation.  We provide Julia access to the Berkeley Tree Database (BTrBD) along with some select convenience methods.","category":"page"},{"location":"#","page":"Introduction","title":"Introduction","text":"BTrDB is a very, very fast timeseries database.  Specifically, it is a time partitioned, version annotated, clustered solution for high density univariate data.  It's also incredibly easy to use.","category":"page"},{"location":"#","page":"Introduction","title":"Introduction","text":"Information on specific versions of these bindings can be found on the Release page.","category":"page"},{"location":"#Package-Manual-1","page":"Introduction","title":"Package Manual","text":"","category":"section"},{"location":"#","page":"Introduction","title":"Introduction","text":"Pages = [\n    \"man/getting_started.md\",\n    \"man/explained.md\",\n    \"man/concepts.md\",\n]\nDepth = 2","category":"page"},{"location":"#API-1","page":"Introduction","title":"API","text":"","category":"section"},{"location":"#","page":"Introduction","title":"Introduction","text":"Only exported (i.e. available for use without BTrDB. qualifier after loading the BTrDB.jl package with using BTrDB) types and functions are considered a part of the public API of the BTrDB.jl package. In general all such objects are documented in this manual (in case some documentation is missing please kindly report an issue here).","category":"page"},{"location":"#","page":"Introduction","title":"Introduction","text":"Please be warned that while Julia allows you to access internal functions or types of BTrDB.jl these can change without warning between versions of BTrDB.jl. In particular it is not safe to directly access fields of types that are a part of public API of the BTrDB.jl package using e.g. the info function. Whenever some operation on fields of defined types is considered allowed an appropriate exported function should be used instead.","category":"page"},{"location":"#","page":"Introduction","title":"Introduction","text":"Pages = [\"lib/types.md\", \"lib/functions.md\"]\nDepth = 2","category":"page"},{"location":"#Index-1","page":"Introduction","title":"Index","text":"","category":"section"},{"location":"#","page":"Introduction","title":"Introduction","text":"Pages = [\"lib/types.md\", \"lib/functions.md\"]","category":"page"}]
}