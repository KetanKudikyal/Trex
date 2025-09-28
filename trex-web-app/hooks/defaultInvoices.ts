export interface Invoice {
  id: string
  paymentRequest: string
  paymentHash: string
  transactionHash: string
  amount: number
  description: string
  status: 'paid' | 'failed' | 'pending'
}

// export const defaultInvoices: Invoice[] = [
//   {
//     id: '1',
//     paymentRequest:
//       'lnbc100n1p5d3rm9dqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5qzkvrlhwe4fg3f2ycsm0u4p0y3930u6ky36yxwd5fe2d4pukr8lssp5nshwrsrlzqdvcdaqmqpy7yvzxpdah58z0svccg5jftg5rpn2p60s9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqpeev0a6rha077xsng3rdzfr5j36q9yx9wq3mv4zpzkv3qx6tdvdyu5d3gzenykkwkmzf0lezvu79kcs3z59vdgw4z9a3vzuzq9pkgncp6x69gz',
//     paymentHash:
//       '00acc1feeecd5288a544c436fe542f244b17f35624744339b44e54da879619ff',
//     transactionHash: '-',
//     amount: 10,
//     description: 'CLH / LiquidBridge',
//     status: 'pending',
//   },
//   {
//     id: '2',
//     amount: 10,
//     paymentRequest:
//       'lnbc100n1p5d3rm8dqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5trqq7x3rcnkg0v7jk2ktu8n8h5s9h5yrp753q7ehtjjkflettyhqsp5cutt2p09p38rfjxv43qthr2mjnr0qzl3vh82nd2gsyzw2d48vlws9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqa8cfdt25jjyjpjycjurlff0srw9lwlh3fcjdunsvp86c0vq6uc2qjme6dxcvqnpaudpcz3fwyx50xprw03dw972xj885kd4qlwptu9gpm9ga39',
//     paymentHash:
//       '58c00f1a23c4ec87b3d2b2acbe1e67bd205bd0830fa9107b375ca564ff2b592e',
//     transactionHash: '-',
//     description: 'CLH / ThunderPool',
//     status: 'pending',
//   },
//   {
//     id: '3',
//     paymentRequest:
//       'lnbc100n1p5d3rmgdqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5mekt9jhkw7xt2e72q6e7fylzacjdrskuws04655d9ugk5cskzx8qsp5al07l5mt3lfyhvkuqdve96snzyryckqnue6s2tmhwdc6r22le2ns9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqy6k3qu0j2nejs6m6ljvw2c63m3d5lhukq4mezmad547l78e80zt5s7e98ja20ngn7v8fhgwgp9nw0j8w4p2a4s9007urchxqmtyjn7qq9j9s3w',
//     paymentHash:
//       'de6cb2caf6778cb567ca06b3e493e2ee24d1c2dc741f5d528d2f116a6216118e',
//     transactionHash: '-',
//     amount: 10,
//     description: 'CLH / CitreaFlux',
//     status: 'pending',
//   },
//   {
//     id: '4',
//     paymentRequest:
//       'lnbc100n1p5d3rmtdqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5xsd3d8vcap60qtx9hud094px2uedlrxw388h3a4zszvnm3wpkcvqsp5akha5lcxml2v6dl2ttm8rsnvffd0praxmx4cqq2wgmrdeexumass9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqrhpdy780aexy5p0m67g67wfduldqurvnjywsgfz2gj8hne373tm9hwnykmkhnycnwqrex4ruylmvlm3qy3ch8c5jzx072fmqz3gfpqgqpudknv',
//     paymentHash:
//       '341b169d98e874f02cc5bf1af2d4265732df8cce89cf78f6a280993dc5c1b618',
//     transactionHash: '-',
//     amount: 10,
//     description: 'CLH / SwapStream',
//     status: 'pending',
//   },
//   {
//     id: '5',
//     paymentRequest:
//       'lnbc100n1p5d3rmddqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5ef0k7cnmpq04jvzcr4fdxwzrzn5whzxdzqekevpvn7t4sw7rxyaqsp5pz0lzgeeeh78zzkafj2u4079m0826ymvqefs37e6faxuuuu68u7s9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjql7t7x72sf8vre55ey9jlmwszynps9w4c7eugrlfjrse4875esgrsh4a0ucp79a8zqnt896flsk3xsrdcvgz0njre02vkx6y476uhqksqy7cvdp',
//     paymentHash:
//       'ca5f6f627b081f5930581d52d3384314e8eb88cd10336cb02c9f97583bc3313a',
//     transactionHash: '-',
//     amount: 10,
//     description: 'CLH / NodeNexus',
//     status: 'pending',
//   },
//   {
//     id: '6',
//     paymentRequest:
//       'lnbc100n1p5d3rm0dqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5jnkl787cdylgd4wk5sv9y6q9y5u83857uccw8cnkgd8cm8sf2hqssp5djhpa4qurs2naq5xjn5c8emp5qaa60vawl54l2c7qnfc5l7th25s9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjq6fhdg2pc35v59m7lfl02ej8gpzyv67vwgehe73nuygjlar8qx09p7fcp4swrq3csm3te6eaq8kwv57uzskm2gep6lvjpvpels63hlvcpypy5kw',
//     paymentHash:
//       '94edff1fd8693e86d5d6a4185268052538789e9ee630e3e276434f8d9e0955c1',
//     transactionHash: '-',
//     amount: 10,
//     description: 'CLH / CitreaSocial',
//     status: 'pending',
//   },
//   {
//     id: '7',
//     paymentRequest:
//       'lnbc100n1p5d3rmsdqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5qk9crfyl35jw85n0f38wpjd894dh69uuhe4v95hyn3m6et9qn4rqsp52s09xqleu58e06jk8wjkasm8v3afj378vtjwxavrklmzsmkxnq0s9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjq5tudn4pqfzpqvm35fy4sxdkw5k8e3lemu8w8vgw3ray5vk85qurnlrx6z89ktekg2xstv37cxmh9dxum88t7yxl3w9xnm7y27cf5lugp7d3z3x',
//     paymentHash:
//       '058b81a49f8d24e3d26f4c4ee0c9a72d5b7d179cbe6ac2d2e49c77acaca09d46',
//     transactionHash: '-',
//     amount: 10,
//     description: 'CLH / VoltVillage',
//     status: 'pending',
//   },
//   {
//     id: '8',
//     paymentRequest:
//       'lnbc100n1p5d3rmjdqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5qqtll2n9knd67d32qv8cca7nkyv542xt52qg4w08fkfd5wk5u4hssp578kwwyhrqqaxl80kgtgj3hsj9s2fa6k38h0vz7uyzfm3y8whmdts9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqzsu89h06z7suy9wudpw5ujm2xr4k3n7tpw2x0zjhyxa4lu87semyqus5au7ujwkzvx38vahlvlgzq5mxrtm4u0jgv6x9tawp2rsav7gqd0mtdq',
//     paymentHash:
//       '0017ffaa65b4dbaf362a030f8c77d3b1194aa8cba2808ab9e74d92da3ad4e56f',
//     transactionHash: '-',
//     amount: 10,
//     description: 'CLH / FlashFlow',
//     status: 'pending',
//   },
//   {
//     id: '9',
//     paymentRequest:
//       'lnbc100n1p5d3rm4dqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5c23e7sdtjxvql3szfxq6jseddpq6nld99m6wax6nfzxengye0nassp59uzx3xklyk72vg4v9x8c5ewv9sp5g4uvsjvmattav803xktmjk0s9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqnmg3sqydgpl4y7l2el72rxxagn30x0qa5fpeyy2yxlmj006vr6m5qjw6mphau52du7d7dfas2w3adge9k8j8mlwwvkf82qj5nv0scgsqwjd24l',
//     paymentHash:
//       'c2a39f41ab91980fc6024981a9432d6841a9fda52ef4ee9b53488d99a0997cfb',
//     transactionHash: '-',
//     amount: 10,
//     description: 'CLH / FlashFlow',
//     status: 'pending',
//   },
//   {
//     id: '10',
//     paymentRequest:
//       'lnbc100n1p5d3rmhdqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp52rsqv56qvuz8cysmvtlqcqxr7kcle3z8xxcy75m52l6h5zsmfw9ssp57cpwy27taay8dts2svl2l5l649cmvr7g9qw5gewqm2ehvt6wufaq9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqnpxspetjp5uvk6xa6lupdaq3z45amqagchew5zh0xqwhemkr7tupe7jfa8znq6dfurk3tm4klf3dagz5gq65kgwky66tr8jpaxrfwxqpp3flvj',
//     paymentHash:
//       '50e006534067047c121b62fe0c00c3f5b1fcc44731b04f537457f57a0a1b4b8b',
//     transactionHash: '-',
//     amount: 10,
//     description: 'CLH / ThunderSwap',
//     status: 'pending',
//   },
// ]
export const defaultInvoices: Invoice[] = [
  {
    id: '1',
    paymentRequest:
      'lnbc100n1p5d39zldqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5klk7s4f3f30szwq9yg0rdt7myq02qjx50ywnc75nvtjz4t2sg25qsp5zx8f54mxpgwh4p9gd6ygfzetmesc65pf43khua6ws42kdkgqtvrq9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjq77ehxxv6vap7s4hu3509d7cxkdp6n4c427nnaf7rhpfv5jkdxh2qt053cdwh8kmv08l7sm54rze8krarnxf3yyu6eshyc7sy04csrtqqegluzc',
    paymentHash:
      'b7ede855314c5f013805221e36afdb201ea048d4791d3c7a9362e42aad5042a8',
    transactionHash: '-',
    amount: 10,
    description: 'CLH / ThunderSwap',
    status: 'pending',
  },
  {
    id: '2',
    amount: 10,
    paymentRequest:
      'lnbc100n1p5d39rzdqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5t0xhlj0x5rz0n5fd8ne3tzf7y9lacpsywlk98a8dpfh2qs6uvszssp5s9ap375d4wm8y824j62xlm2jkhyhtcgckjypqma9gt0p99vlclhq9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjq6ammxwy6zv4psh90alsg28d2pq0r88s58nmr7pfmjsglpcccrggxy54zmg0c4glh0wlrgfwcpwfssme6a2r5ektyc422s3udtutmg6sphucgng',
    paymentHash:
      '5bcd7fc9e6a0c4f9d12d3cf315893e217fdc060477ec53f4ed0a6ea0435c6405',
    transactionHash: '-',
    description: 'CLH / ThunderPool',
    status: 'pending',
  },
]
