import {initialRooms} from "../../element/room"
import {initialAutomations} from "../../element/automations"
import {icons} from "../../element/icons"
import {groups} from "../../element/groups"
import {chart} from "../../element/chart"
import {themeCss, nightCss, weatherCss, mobileHeaderCss, sensorCss, modalCss, css} from "../style/DashboardCss"
  

import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, LabelList, ResponsiveContainer,
  Tooltip, XAxis,  YAxis } from 'recharts';
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowLeft,
  FiCamera,
  FiChevronDown,
  FiCloud,
  FiDroplet,
  FiHome,
  FiLock,
  FiMenu,
  FiMonitor,
  FiMoon,
  FiPower,
  FiThermometer,
  FiX,
  FiZap
}
  from 'react-icons/fi';
import {
  MdBlinds,
  MdLightbulbOutline,
  MdLocalLaundryService,
  MdMicrowave
}
  from 'react-icons/md';

const canControl = function (type) {
  return type !== 'sensor'
};

export default function DashboardView() {
  const [rooms, setRooms] = useState(initialRooms);
  const [view, setView] = useState({type: 'home'});
  const [zone, setZone] = useState('Tutte');
  const [collapsed, setCollapsed] = useState({});
  const [dialog, setDialog] = useState(null);
  const [menu, setMenu] = useState(false);
  const [automations, setAutomations] = useState(initialAutomations);
  const [theme, setTheme] = useState(function () {
      var saved = localStorage.getItem('homehub-theme');
      return ['blue', 'green', 'purple', 'gray', 'black', 'yellow', 'red', 'teal'].includes(saved) ? saved : 'blue'
    });
  const [layout, setLayout] = useState(function () {
      var saved = localStorage.getItem('homehub-layout');
      return ['light', 'night', 'default'].includes(saved) ? saved : 'default'
    });
  const active = useMemo(function () {
    return rooms.flatMap(function (room) {
      return room.devices
    }).filter(function (device) {
      return device.active && canControl(device.type)
    }).length
  }, [rooms]);
  const date = new Intl.DateTimeFormat('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long'
  }).format(new Date());
  const appliedLayout = layout === 'default' ? (new Date().getHours() >= 7 && new Date().getHours() < 20 ? 'light' : 'night') : layout;
  useEffect(function () {
    if (view.type !== 'home') window.scrollTo({
      top: 0, left: 0, behavior: 'auto'
    })
  }, [view.type]);
  useEffect(function () {
    localStorage.setItem('homehub-theme', theme)
  }, [theme]);
  useEffect(function () {
    localStorage.setItem('homehub-layout', layout)
  }, [layout]);
  function go(type) {
    var ids = ['active', 'security'].includes(type) ? rooms.flatMap(function (room) {
      return room.devices
    }).filter(function (device) {
      return device.active && canControl(device.type) && (type !== 'security' || ['security', 'door'].includes(device.type))
    }).map(function (device) {
      return device.id
    }) : undefined;
    setView({
      type: type, deviceIds: ids
    });
    setMenu(false)
  }
  function home() {
    setView({
      type: 'home'
    });
    setMenu(false)
  }
  function toggle(id) {
    setRooms(function (current) {
      return current.map(function (room) {
        return {
          ...room, devices: room.devices.map(function (device) {
            return device.id === id ? {
              ...device, active: !device.active
            } : device
          })
        }
      })
    })
  }
  function changeTemperature(delta) {
    setRooms(function (current) {
      return current.map(function (room) {
        return {
          ...room, devices: room.devices.map(function (device) {
            if (device.id !== dialog.id) return device;
            var value = Number.parseFloat(device.value.replace(',', '.')) + delta;
            return {
              ...device, value: value.toFixed(1).replace('.', ',') + ' \u00B0C'
            }
          })
        }
      })
    })
  }
  function Device(props) {
    var device = props.device,
      Icon = icons[device.type] || FiActivity,
      enabled = canControl(device.type);
    return <button className={
      'device ' + (device.active ? 'on' : '')
    }
      disabled={
        !enabled
      }
      onClick={
        function () {
          if (enabled) toggle(device.id)
        }
      }
    ><i><Icon /></i><span><b>{
      device.name
    }
    </b></span></button>
  }
  function Room(props) {
    var room = props.room,
      Icon = room.icon,
      temp = room.devices.find(function (device) {
        return device.type === 'sensor'
      }),
      sections = room.devices.filter(function (device) {
        return device.type !== 'sensor'
      }).reduce(function (all, device) {
        var name = groups[device.type];
        all[name] = (all[name] || []).concat(device);
        return all
      }, {
      });
    return <article className="room"><div className="room-head"><button className="room-title" disabled={
      props.detail
    }
      onClick={
        function () {
          if (!props.detail) setView({
            type: 'room', name: room.name
          })
        }
      }
    ><i><Icon /></i><span><b>{
      room.name
    }
    </b></span></button>{
        temp && <button className="temperature" onClick={
          function () {
            setDialog(temp)
          }
        }
        ><FiThermometer />{
            temp.value
          }
        </button>
      }
    </div>{
        Object.entries(sections).map(function (entry) {
          var title = entry[0], devices = entry[1], key = room.name + '-' + title, closed = collapsed[key];
          return <section className="area" key={
            key
          }
          ><header><h3>{
            title
          }
          </h3><button onClick={
            function () {
              setCollapsed(function (current) {
                return {
                  ...current, [key]: !current[key]
                }
              })
            }
          }
          ><FiChevronDown className={
            closed ? '' : 'up'
          }
                /></button></header>{
              !closed && <div className="devices">{
                devices.map(function (device) {
                  return <Device key={
                    device.id
                  }
                    device={
                      device
                    }
                  />
                })
              }
              </div>
            }
          </section>
        })
      }
    </article>
  }
  function Back(props) {
    return <header className="detail-head"><button onClick={
      home
    }
    ><FiArrowLeft /> Dashboard</button><div><p>{
      props.kicker
    }
    </p><h1>{
      props.title
    }
        </h1></div></header>
  }
  function DeviceList() {
    var temp = view.type === 'temperature';
    var title = temp ? 'Temperature' : view.type === 'security' ? 'Sicurezza attiva' : 'Dispositivi attivi';
    return <><Back title={
      title
    }
      kicker="Controlla i dispositivi per ogni zona" /><section className="listing">{
        rooms.map(function (room) {
          var items = temp ? room.devices.filter(function (device) {
            return device.type === 'sensor'
          }) : room.devices.filter(function (device) {
            return view.deviceIds.includes(device.id)
          });
          if (!items.length) return null;
          var Icon = room.icon;
          return temp ? <article className="room" key={
            room.name
          }
          ><div className="room-head"><div className="room-title"><i><Icon /></i><span><b>{
            room.name
          }
          </b></span></div></div><div className="sensors">{
            items.map(function (device) {
              return <button key={
                device.id
              }
                onClick={
                  function () {
                    setDialog(device)
                  }
                }
              ><FiThermometer /><span>{
                device.name
              }
                </span><b>{
                  device.value
                }
                </b></button>
            })
          }
            </div></article> : <article className="room" key={
              room.name
            }
            ><div className="room-head"><div className="room-title"><i><Icon /></i><span><b>{
              room.name
            }
            </b></span></div></div><div className="devices">{
              items.map(function (device) {
                return <Device key={
                  device.id
                }
                  device={
                    device
                  }
                />
              })
            }
            </div></article>
        })
      }
      </section></>
  }
  function AutomationList(props) {
    return automations.filter(function (item) {
      return item.active === props.active
    }).map(function (item) {
      return <button className={
        'automation ' + (item.active ? 'on' : '')
      }
        key={
          item.id
        }
        onClick={
          function () {
            setAutomations(function (current) {
              return current.map(function (value) {
                return value.id === item.id ? {
                  ...value, active: !value.active
                } : value
              })
            })
          }
        }
      ><i><FiZap /></i><span><b>{
        item.name
      }
      </b><small>{
        item.description
      }
          </small></span><em>{
            item.active ? 'Attiva' : 'Non attiva'
          }
        </em></button>
    })
  }
  function Settings() {
    return <><Back title="Impostazioni" kicker="Personalizza la tua dashboard" /><section className="settings"><article><h2>Layout</h2><p>Scegli l’aspetto dell’interfaccia.</p><div className="choices">{
      [['light', 'Light'], ['night', 'Night'], ['default', 'Default']].map(function (item) {
        return <button key={
          item[0]
        }
          className={
            layout === item[0] ? 'selected' : ''
          }
          onClick={
            function () {
              setLayout(item[0])
            }
          }
        >{
            item[1]
          }
        </button>
      })
    }
    </div></article><article><h2>Tema</h2><p>Scegli il colore principale.</p><div className="colors">{
      ['blue', 'green', 'purple', 'gray', 'black', 'yellow', 'red', 'teal'].map(function (item) {
        return <button key={
          item
        }
          className={
            theme === item ? 'selected' : ''
          }
          data-color={
            item
          }
          onClick={
            function () {
              setTheme(item)
            }
          }
        />
      })
    }
    </div></article></section></>
  }
  var dashboard = <><header><p>Buongiorno</p><h1>La tua casa,
    sotto controllo.</h1></header><section className="stats"><button onClick={
      function () {
        go('active')
      }
    }
    ><FiZap /><span>Dispositivi attivi<b>{
      active
    }
    </b></span></button><button onClick={
      function () {
        go('temperature')
      }
    }
    ><FiThermometer /><span>Temperatura media<b>22,
      2 {
        '\u00B0C'
      }
    </b></span></button><button onClick={
      function () {
        go('security')
      }
    }
    ><FiLock /><span>Sicurezza<b>Protetta</b></span></button></section><div className="filters"><b>Zone</b><div>{
      ['Tutte', 'Zona Giorno', 'Zona Notte'].map(function (item) {
        return <button key={
          item
        }
          className={
            zone === item ? 'selected' : ''
          }
          onClick={
            function () {
              setZone(item)
            }
          }
        >{
            item
          }
        </button>
      })
    }
    </div></div>{
      zone === 'Tutte' && <section className="chart"><h2>Consumi settimanali</h2><div><ResponsiveContainer width="100%" height="100%"><BarChart data={
        chart
      }
        margin={
          {
            top: 20,
            right: 12,
            left: 12,
            bottom: 0
          }
        }
      ><XAxis dataKey="day" axisLine={
        false
      }
        tickLine={
          false
        }
        /><YAxis width={
          58
        }
          axisLine={
            false
          }
          tickLine={
            false
          }
          unit=" kWh" /><Tooltip /><Bar dataKey="value" fill="var(--accent)" radius={
            [8, 8, 2, 2]
          }
          ><LabelList dataKey="value" position="top" /></Bar></BarChart></ResponsiveContainer></div></section>
    }
    <section className="rooms">{
      (zone === 'Tutte' ? rooms : rooms.filter(function (room) {
        return room.zone === zone
      })).map(function (room) {
        return <Room key={
          room.name
        }
          room={
            room
          }
        />
      })
    }
    </section></>;
  var current = view.type === 'room' ? rooms.find(function (room) {
    return room.name === view.name
  }) : null;
  var content = view.type === 'home' ? dashboard : view.type === 'settings' ? <Settings /> : view.type === 'room' ? <><Back title={
    current.name
  }
    kicker={
      current.zone
    }
  /><section className="rooms single"><Room room={
    current
  }
    detail /></section></> : view.type === 'automations' ? <><Back title="Automazioni" kicker="Le regole della tua casa" /><section className="automation-list"><article><h2>Attive</h2><AutomationList active={
      true
    }
    /></article><article><h2>Non attive</h2><AutomationList active={
      false
    }
    /></article></section></> : <DeviceList />;
  return <main data-theme={
    theme
  }
    data-layout={
      appliedLayout
    }
  ><style>{
    css + themeCss + nightCss + mobileHeaderCss + weatherCss + sensorCss + modalCss
  }
    </style><aside><div className="brand">HOME<span>HUB</span><small className="live mobile-live"><i />Sistema connesso</small></div><button className="menu" onClick={
      function () {
        setMenu(!menu)
      }
    }
    >{
        menu ? <FiX /> : <FiMenu />
      }
    </button><div className="clock">{
      new Date().toLocaleTimeString('it-IT', {
        hour: '2-digit', minute: '2-digit'
      })
    }
      </div><p className="date">{
        date
      }
      </p><div className="weather"><FiCloud /><div><b>24{
        '\u00B0C'
      }
      </b><small><span>Sereno</span><span><FiDroplet />48% umidità</span></small></div></div><nav className={
        menu ? 'open' : ''
      }
      ><button className={
        view.type === 'home' ? 'selected' : ''
      }
        onClick={
          home
        }
      ><FiHome />Panoramica</button><button onClick={
        function () {
          go('active')
        }
      }
      ><FiActivity />Attività</button><button onClick={
        function () {
          go('security')
        }
      }
      ><FiAlertTriangle />Sicurezza</button><button className={
        view.type === 'automations' ? 'selected' : ''
      }
        onClick={
          function () {
            go('automations')
          }
        }
      ><FiZap />Automazioni</button><button className={
        view.type === "settings" ? "selected" : ""
      }
        onClick={
          function () {
            go("settings")
          }
        }
      ><FiMonitor />Impostazioni</button><p className="live desktop-live"><i />Sistema connesso</p></nav></aside><section className="content">{
        content
      }
    </section>{
      dialog && <div className="modal-back" onClick={
        function () {
          setDialog(null)
        }
      }
      ><section className="modal" onClick={
        function (event) {
          event.stopPropagation()
        }
      }
      ><button className="close" onClick={
        function () {
          setDialog(null)
        }
      }
      ><FiX /></button><div className="modal-title"><FiThermometer /><p>{
        dialog.name
      }
      </p></div><strong>{
        rooms.flatMap(function (room) {
          return room.devices
        }).find(function (device) {
          return device.id === dialog.id
        }).value
      }
          </strong><div className="temperature-actions"><button onClick={
            function () {
              changeTemperature(-1)
            }
          }
          >−</button><span>1 °C</span><button onClick={
            function () {
              changeTemperature(1)
            }
          }
          >+</button></div></section></div>
    }
  </main>
}
