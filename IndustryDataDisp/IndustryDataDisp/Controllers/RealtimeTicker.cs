
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
namespace IndustryDataDisp.Controllers
{
    public class RealtimeTicker
    {
        private readonly static Lazy<RealtimeTicker> _instance = new Lazy<RealtimeTicker>(() => new RealtimeTicker(GlobalHost.ConnectionManager.GetHubContext<TickerHub>().Clients));
        private readonly TimeSpan _updateInterval = TimeSpan.FromMilliseconds(5000);
        private readonly TimeSpan _fetchInterval = TimeSpan.FromMilliseconds(5000);
        private Timer _brocastTimer;
        private Timer _fetchTimer;
        private volatile bool _updatingMarker;
        private RealtimeTicker(Microsoft.AspNet.SignalR.Hubs.IHubConnectionContext<dynamic> clients)
        {
            Clients = clients;
            _updatingMarker = false;
            Init();
        }

        public static RealtimeTicker Instance
        {
            get
            {
                return _instance.Value;
            }
        }

        private IHubConnectionContext<dynamic> Clients
        {
            get;
            set;
        }

        /// <summary>
        /// 开
        /// </summary>
        public void Init()
        {
            _brocastTimer = new Timer(UpdateAllData, null, _updateInterval, _updateInterval);
            _fetchTimer = new Timer(Genedata, null, _fetchInterval, _fetchInterval);
        }

        private void UpdateAllData(object state)
        {
            if (!_updatingMarker)
            {
            }
        }

        private void Genedata(object state)
        {
            _updatingMarker = true;
            _updatingMarker = false;
        }

        /// <summary>
        /// 关
        /// </summary>
        public void TickerDispose()
        {
            if (_brocastTimer != null)
            {
                _brocastTimer.Dispose();
            } if (_fetchTimer != null)
            {
                _fetchTimer.Dispose();
            }
        }

    }
    [HubName("realtimeTicker")]
    public class TickerHub : Microsoft.AspNet.SignalR.Hub
    {
        private readonly RealtimeTicker _realtimeTicker;

        public TickerHub()
            : this(RealtimeTicker.Instance)
        {
        }

        public TickerHub(RealtimeTicker realtimeTicker)
        {
            _realtimeTicker = realtimeTicker;
        }

       

        public void TickerDispose()
        {
            _realtimeTicker.TickerDispose();
        }

        public override Task OnConnected()
        {
            string clientId = Context.ConnectionId;
            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            string clientId = Context.ConnectionId;
            return base.OnDisconnected(stopCalled);
        }

        public override Task OnReconnected()
        {
            string clientId = Context.ConnectionId;
            return base.OnReconnected();
        }
    }
}